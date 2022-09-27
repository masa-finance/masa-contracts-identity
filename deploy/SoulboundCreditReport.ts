import hre from "hardhat";
import { getEnvParams } from "../src/utils/EnvParams";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";

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
  const baseUri = `${env.BASE_URI}/credit-report/`;

  const soulLinker = await deployments.get("SoulLinker");

  const constructorArguments = [
    env.ADMIN || admin.address,
    soulLinker.address,
    baseUri
  ];

  const soulboundCreditReportDeploymentResult = await deploy(
    "SoulboundCreditReport",
    {
      from: deployer,
      args: constructorArguments,
      log: true
      // nonce: currentNonce + 1 // to solve REPLACEMENT_UNDERPRICED, when needed
    }
  );

  // verify contract with etherscan, if its not a local network
  if (network.name == "mainnet" || network.name == "goerli") {
    try {
      await hre.run("verify:verify", {
        address: soulboundCreditReportDeploymentResult.address,
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
};

func.tags = ["SoulboundCreditReport"];
func.dependencies = ["SoulLinker"];
export default func;
