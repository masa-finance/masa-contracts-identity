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

  [owner] = await ethers.getSigners();
  const env = getEnvParams(network.name);

  const soulLinkerDeploymentResult = await deploy("SoulLinker", {
    from: deployer,
    args: [owner.address],
    log: true
  });

  await ethers.getContractAt("SoulLinker", soulLinkerDeploymentResult.address);
};

func.tags = ["SoulLinker"];
export default func;
