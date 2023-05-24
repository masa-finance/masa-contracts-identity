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

  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");
  const soulNameDeployed = await deployments.get("SoulName");

  if (
    network.name === "mainnet" ||
    network.name === "goerli" ||
    network.name === "hardhat" ||
    network.name === "mumbai" ||
    network.name === "polygon"
  ) {
    // deploy contract
    const soulLinkerDeploymentResult = await deploy("SoulLinker", {
      from: deployer,
      args: [],
      log: true
      // nonce: currentNonce + 1 // to solve REPLACEMENT_UNDERPRICED, when needed
    });

    const soulLinker = await ethers.getContractAt(
      "SoulLinker",
      soulLinkerDeploymentResult.address
    );

    // initialize contract
    await soulLinker.initialize(
      env.ADMIN || admin.address,
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
          address: soulLinkerDeploymentResult.address,
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

    if (network.name === "hardhat" || network.name === "mumbai") {
      // we add payment methods

      const signer = env.ADMIN
        ? new ethers.Wallet(getPrivateKey(network.name), ethers.provider)
        : admin;

      const soulLinker = await ethers.getContractAt(
        "SoulLinker",
        soulLinkerDeploymentResult.address
      );

      const paymentMethods = env.PAYMENT_METHODS_SOULLINKER.split(" ");
      for (let i = 0; i < paymentMethods.length; i++) {
        await soulLinker.connect(signer).enablePaymentMethod(paymentMethods[i]);
      }
    }
  }
};

func.skip = async ({ network }) => {
  return (
    network.name !== "mainnet" &&
    network.name !== "goerli" &&
    network.name !== "hardhat" &&
    network.name !== "mumbai" &&
    network.name !== "polygon"
  );
};
func.tags = ["SoulLinker"];
func.dependencies = [
  "SoulboundIdentity",
  "SoulName",
  "SoulboundCreditScore",
  "SoulboundGreen"
];
export default func;
