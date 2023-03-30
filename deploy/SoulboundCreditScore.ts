import hre from "hardhat";
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

  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");

  if (
    network.name === "mainnet" ||
    network.name === "goerli" ||
    network.name === "hardhat"
  ) {
    // deploy contract
    const soulboundCreditScoreDeploymentResult = await deploy(
      "SoulboundCreditScore",
      {
        from: deployer,
        args: [],
        log: true
        // nonce: currentNonce + 1 // to solve REPLACEMENT_UNDERPRICED, when needed
      }
    );

    const soulboundCreditScore = await ethers.getContractAt(
      "SoulboundCreditScore",
      soulboundCreditScoreDeploymentResult.address
    );

    // initialize contract
    await soulboundCreditScore.initialize(
      env.ADMIN || admin.address,
      env.SOULBOUNDCREDITSCORE_NAME,
      env.SOULBOUNDCREDITSCORE_SYMBOL,
      baseUri,
      soulboundIdentityDeployed.address,
      {
        swapRouter: env.SWAP_ROUTER,
        wrappedNativeToken: env.WETH_TOKEN,
        stableCoin: env.USDC_TOKEN,
        masaToken: env.MASA_TOKEN,
        reserveWallet: env.RESERVE_WALLET || admin.address
      }
    );

    // verify contract with etherscan, if its not a local network
    if (network.name !== "hardhat") {
      try {
        await hre.run("verify:verify", {
          address: soulboundCreditScoreDeploymentResult.address,
          constructorArguments: []
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

    if (network.name === "hardhat") {
      const signer = env.ADMIN
        ? new ethers.Wallet(getPrivateKey(network.name), ethers.provider)
        : admin;

      // add authority to soulboundCreditScore
      await soulboundCreditScore
        .connect(signer)
        .addAuthority(env.AUTHORITY_WALLET || admin.address);

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
    network.name !== "mainnet" &&
    network.name !== "goerli" &&
    network.name !== "hardhat"
  );
};
func.tags = ["SoulboundCreditScore"];
func.dependencies = ["SoulboundIdentity"];
export default func;
