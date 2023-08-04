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
  const baseUri = `${env.BASE_URI}/identity/${network.name}/`;

  const constructorArguments = [
    env.ADMIN || admin.address,
    env.SOULBOUNDIDENTITY_NAME,
    env.SOULBOUNDIDENTITY_SYMBOL,
    baseUri,
    [
      env.SWAP_ROUTER,
      env.WETH_TOKEN,
      env.USDC_TOKEN,
      env.MASA_TOKEN,
      env.PROJECTFEE_RECEIVER || admin.address,
      env.PROTOCOLFEE_RECEIVER || ethers.constants.AddressZero,
      env.PROTOCOLFEE_AMOUNT || 0,
      env.PROTOCOLFEE_PERCENT || 0
    ]
  ];

  if (
    network.name === "mainnet" ||
    network.name === "goerli" ||
    network.name === "hardhat" ||
    network.name === "celo" ||
    network.name === "alfajores" ||
    network.name === "base" ||
    network.name === "basegoerli" ||
    network.name === "bsctest" ||
    network.name === "bsc" ||
    network.name === "mumbai" ||
    network.name === "polygon"
  ) {
    const soulboundIdentityDeploymentResult = await deploy(
      "SoulboundIdentity",
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
        await hre.run("verify:verify", {
          address: soulboundIdentityDeploymentResult.address,
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
  }
};

func.skip = async ({ network }) => {
  return (
    network.name !== "mainnet" &&
    network.name !== "goerli" &&
    network.name !== "hardhat" &&
    network.name !== "celo" &&
    network.name !== "alfajores" &&
    network.name !== "base" &&
    network.name !== "basegoerli" &&
    network.name !== "bsctest" &&
    network.name !== "bsc" &&
    network.name !== "mumbai" &&
    network.name !== "polygon"
  );
};
func.tags = ["SoulboundIdentity"];
export default func;
