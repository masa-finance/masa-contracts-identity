import { run } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { getEnvParams, getPrivateKey } from "../src/EnvParams";

let admin: SignerWithAddress;

const func: DeployFunction = async ({
  // @ts-ignore
  getNamedAccounts,
  // @ts-ignore
  deployments,
  // @ts-ignore
  ethers,
  network
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // const currentNonce: number = await ethers.provider.getTransactionCount(deployer);
  // to solve REPLACEMENT_UNDERPRICED, when needed

  [, admin] = await ethers.getSigners();
  const env = getEnvParams(network.name);
  const baseUri = `${env.BASE_URI}/credit-score/${network.name}/`;

  let soulboundIdentityDeployedAddress;
  if (
    network.name === "ethereum" ||
    network.name === "sepolia" ||
    network.name === "hardhat" ||
    network.name === "mumbai" ||
    network.name === "polygon"
  ) {
    const soulboundIdentityDeployed =
      await deployments.get("SoulboundIdentity");
    soulboundIdentityDeployedAddress = soulboundIdentityDeployed.address;
  } else {
    soulboundIdentityDeployedAddress = ethers.constants.AddressZero;
  }

  const constructorArguments = [
    env.ADMIN || admin.address,
    env.SOULBOUNDCREDITSCORE_NAME,
    env.SOULBOUNDCREDITSCORE_SYMBOL,
    baseUri,
    soulboundIdentityDeployedAddress,
    [
      env.SWAP_ROUTER,
      env.WETH_TOKEN,
      env.USDC_TOKEN,
      env.MASA_TOKEN,
      env.PROJECTFEE_RECEIVER || admin.address,
      env.PROTOCOLFEE_RECEIVER || ethers.constants.AddressZero,
      env.PROTOCOLFEE_AMOUNT || 0,
      env.PROTOCOLFEE_PERCENT || 0,
      env.PROTOCOLFEE_PERCENT_SUB || 0
    ]
  ];

  if (
    network.name === "ethereum" ||
    network.name === "sepolia" ||
    network.name === "hardhat" ||
    network.name === "mumbai" ||
    network.name === "polygon"
  ) {
    const soulboundCreditScoreDeploymentResult = await deploy(
      "SoulboundCreditScore",
      {
        from: deployer,
        args: constructorArguments,
        log: true
        // nonce: currentNonce + 1 // to solve REPLACEMENT_UNDERPRICED, when needed
      }
    );

    // verify contract with etherscan, if its not a local network or celo
    if (network.name !== "hardhat") {
      try {
        await run("verify:verify", {
          address: soulboundCreditScoreDeploymentResult.address,
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

    if (network.name === "hardhat" || network.name === "mumbai") {
      const signer = env.ADMIN
        ? new ethers.Wallet(getPrivateKey(network.name), ethers.provider)
        : admin;

      const soulboundCreditScore = await ethers.getContractAt(
        "SoulboundCreditScore",
        soulboundCreditScoreDeploymentResult.address
      );

      // add authorities to soulboundCreditScore
      const authorities = (env.AUTHORITY_WALLET || admin.address).split(" ");
      for (let i = 0; i < authorities.length; i++) {
        await soulboundCreditScore.connect(signer).addAuthority(authorities[i]);
      }

      // add mint price to soulboundCreditScore
      await soulboundCreditScore
        .connect(signer)
        .setMintPrice(env.SOULBOUNDCREDITSCORE_MINTING_PRICE || 1000000); // 1 USDC

      // we add payment methods
      const paymentMethods =
        env.PAYMENT_METHODS_SOULBOUNDCREDITSCORE.split(" ");
      for (let i = 0; i < paymentMethods.length; i++) {
        await soulboundCreditScore
          .connect(signer)
          .enablePaymentMethod(paymentMethods[i]);
      }
    }
  }
};

func.skip = async ({ network }) => {
  return (
    network.name !== "ethereum" &&
    network.name !== "sepolia" &&
    network.name !== "hardhat" &&
    network.name !== "mumbai" &&
    network.name !== "polygon"
  );
};
func.tags = ["SoulboundCreditScore"];
func.dependencies = ["SoulboundIdentity"];
export default func;
