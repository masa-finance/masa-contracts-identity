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

  const SoulboundCreditReportDeploymentResult = await deploy(
    "SoulboundCreditReport",
    {
      from: deployer,
      args: [env.OWNER || owner.address, soulLinker.address, baseUri],
      log: true
    }
  );

  await ethers.getContractAt(
    "SoulboundCreditReport",
    SoulboundCreditReportDeploymentResult.address
  );
};

func.tags = ["SoulboundCreditReport"];
func.dependencies = ["SoulLinker"];
export default func;
