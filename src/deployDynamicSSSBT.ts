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

  const SBT_NAME = "";
  const SBT_SYMBOL = "";
  const SBT_BASE_URI = "";
  const SBT_MAXMINTS = 1;
  const PAYMENT_METHODS = "0x0000000000000000000000000000000000000000";
  const MINTING_PRICE = 0;

  console.log(
    `Deploying to ${network.name} (chainId: ${network.config.chainId})`
  );
  console.log(`Deploying with the account: ${deployer}`);

  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");

  const constructorArguments = [
    env.ADMIN,
    SBT_NAME,
    SBT_SYMBOL,
    SBT_BASE_URI,
    soulboundIdentityDeployed.address,
    [
      env.SWAP_ROUTER,
      env.WETH_TOKEN,
      env.USDC_TOKEN,
      env.MASA_TOKEN,
      env.PROJECTFEE_RECEIVER,
      env.PROTOCOLFEE_RECEIVER || ethers.constants.AddressZero,
      env.PROTOCOLFEE_AMOUNT || 0,
      env.PROTOCOLFEE_PERCENT || 0,
      env.PROTOCOLFEE_PERCENT_SUB || 0
    ],
    SBT_MAXMINTS
  ];

  const sssbt = await deploy("MasaDynamicSSSBT", {
    from: deployer,
    args: constructorArguments,
    log: true
  });

  console.log(`MasaDynamicSSSBT deployed to: ${sssbt.address}`);

  // Verify contract
  if (
    network.name !== "hardhat" &&
    network.name !== "masa" &&
    network.name !== "masatest"
  ) {
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
    network.name !== "ethereum" &&
    network.name !== "polygon" &&
    network.name !== "opbnb"
  ) {
    const signer = new ethers.Wallet(
      getPrivateKey(network.name),
      ethers.provider
    );

    const MasaDynamicSSSBT = await ethers.getContractAt(
      "MasaDynamicSSSBT",
      sssbt.address
    );

    // add authorities
    const authorities = env.AUTHORITY_WALLET.split(" ");
    for (let i = 0; i < authorities.length; i++) {
      console.log(`Adding authority ${authorities[i]}`);
      await MasaDynamicSSSBT.connect(signer).addAuthority(authorities[i]);
    }

    // add mint price
    if (+MINTING_PRICE != 0) {
      await MasaDynamicSSSBT.connect(signer).setMintPrice(MINTING_PRICE);
    }

    // we add payment methods
    const paymentMethods = PAYMENT_METHODS.split(" ");
    for (let i = 0; i < paymentMethods.length; i++) {
      console.log(`Adding payment method ${paymentMethods[i]}`);
      await MasaDynamicSSSBT.connect(signer).enablePaymentMethod(
        paymentMethods[i]
      );
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
