import hre from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { getEnvParams } from "../src/EnvParams";

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
  const baseUri = `${env.BASE_URI}/sbt/${network.name}/`;

  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");

  if (
    network.name === "mainnet" ||
    network.name === "goerli" ||
    network.name === "hardhat"
  ) {
    // deploy contract
    const soulboundBaseSelfSovereignDeploymentResult = await deploy(
      "SoulboundBaseSelfSovereign",
      {
        from: deployer,
        args: [],
        log: true
        // nonce: currentNonce + 1 // to solve REPLACEMENT_UNDERPRICED, when needed
      }
    );

    const soulboundBaseSelfSovereign = await ethers.getContractAt(
      "SoulboundBaseSelfSovereign",
      soulboundBaseSelfSovereignDeploymentResult.address
    );

    // initialize contract
    await soulboundBaseSelfSovereign.initialize(
      env.ADMIN || admin.address,
      "Soulbound Test",
      "SBT",
      "Soulbound Test",
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
    if (network.name === "mainnet" || network.name === "goerli") {
      try {
        await hre.run("verify:verify", {
          address: soulboundBaseSelfSovereignDeploymentResult.address,
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
  }
};

func.skip = async ({ network }) => {
  return (
    network.name !== "mainnet" &&
    network.name !== "goerli" &&
    network.name !== "hardhat"
  );
};
func.tags = ["SoulboundBaseSelfSovereign"];
func.dependencies = ["SoulboundIdentity"];
export default func;
