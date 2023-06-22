/* eslint-disable no-console */
import "@nomiclabs/hardhat-ethers";
import hre from "hardhat";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { getEnvParams, getPrivateKey } from "./EnvParams";

/**
 * main function
 */
async function main() {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const env = getEnvParams(network.name);

  console.log(
    `Deploying to ${network.name} (chainId: ${network.config.chainId})`
  );
  console.log(`Deploying with the account: ${deployer}`);

  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");

  const constructorArguments = [
    env.ADMIN,
    "Cloud Bound Token",
    "CBT",
    "https://arweave.net/lykHq8B2CfIH9R0ox69IaK1kFZVCndxuIKXRyLaK59k",
    soulboundIdentityDeployed.address,
    [
      env.SWAP_ROUTER,
      env.WETH_TOKEN,
      env.USDC_TOKEN,
      env.MASA_TOKEN,
      env.PROJECTFEE_RECEIVER,
      env.PROTOCOLFEE_RECEIVER || ethers.constants.AddressZero,
      env.PROTOCOLFEE_AMOUNT || 0,
      env.PROTOCOLFEE_PERCENT || 0
    ],
    1 // maxMints
  ];

  console.log(constructorArguments);

  const sssbt = await deploy("ReferenceSBTSelfSovereign", {
    from: deployer,
    args: constructorArguments,
    log: true
  });

  console.log(`ReferenceSBTSelfSovereign deployed to: ${sssbt.address}`);

  // Verify contract
  if (network.name !== "hardhat") {
    try {
      await hre.run("verify:verify", {
        address: sssbt.address,
        constructorArguments
      });
    } catch (error) {
      if (
        !error.message.includes("Contract source code already verified") &&
        !error.message.includes("Reason: Already Verified")
      ) {
        throw error;
      }
    }
  }

  // if it's not a production network, we set the variables
  if (
    network.name !== "bsc" &&
    network.name !== "celo" &&
    network.name !== "mainnet" &&
    network.name !== "polygon"
  ) {
    const signer = new ethers.Wallet(
      getPrivateKey(network.name),
      ethers.provider
    );

    const SssBT = await ethers.getContractAt(
      "ReferenceSBTSelfSovereign",
      sssbt.address
    );

    // add authorities to soulboundCreditScore
    const authorities = env.AUTHORITY_WALLET.split(" ");
    for (let i = 0; i < authorities.length; i++) {
      console.log(`Adding authority ${authorities[i]}`);
      await SssBT.connect(signer).addAuthority(authorities[i]);
    }

    // add mint price to soulboundCreditScore
    if (+env.SOULBOUNDCREDITSCORE_MINTING_PRICE != 0) {
      await SssBT.connect(signer).setMintPrice(
        env.SOULBOUNDCREDITSCORE_MINTING_PRICE
      );
    }

    // we add payment methods
    const paymentMethods = env.PAYMENT_METHODS_SOULBOUNDCREDITSCORE.split(" ");
    for (let i = 0; i < paymentMethods.length; i++) {
      console.log(`Adding payment method ${paymentMethods[i]}`);
      await SssBT.connect(signer).enablePaymentMethod(paymentMethods[i]);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
