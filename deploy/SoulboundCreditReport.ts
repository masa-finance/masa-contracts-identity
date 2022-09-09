import hre from "hardhat";
import { getEnvParams } from "../src/utils/EnvParams";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";

let owner: SignerWithAddress;

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

  [, owner] = await ethers.getSigners();
  const env = getEnvParams(network.name);
  const baseUri = `${env.BASE_URI}/credit-report/`;

  const soulLinker = await deployments.get("SoulLinker");

  const soulboundCreditReportDeploymentResult = await deploy(
    "SoulboundCreditReport",
    {
      from: deployer,
      args: [env.OWNER || owner.address, soulLinker.address, baseUri],
      log: true
    }
  );

  // verify contract with etherscan, if its not a local network
  if ((await owner.getChainId()) != 31337) {
    await hre.run("verify:verify", {
      address: soulboundCreditReportDeploymentResult.address,
      constructorArguments: [
        env.OWNER || owner.address,
        soulLinker.address,
        baseUri
      ]
    });
  }
};

func.tags = ["SoulboundCreditReport"];
func.dependencies = ["SoulLinker"];
export default func;
