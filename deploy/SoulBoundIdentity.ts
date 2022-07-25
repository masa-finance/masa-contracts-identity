import { getEnvParams } from "../src/utils/EnvParams";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";

let owner: SignerWithAddress;

const func: DeployFunction = async ({
  getNamedAccounts,
  deployments,
  ethers,
  network,
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  [, owner] = await ethers.getSigners();
  const env = getEnvParams(network.name);

  const soulLinker = await deployments.get("SoulLinker");

  const soulBoundTokenDeploymentResult = await deploy("SoulBoundIdentity", {
    from: deployer,
    args: [env.OWNER || owner.address, soulLinker.address],
    log: true,
  });

  await ethers.getContractAt(
    "SoulBoundIdentity",
    soulBoundTokenDeploymentResult.address
  );
};

func.tags = ["SoulBoundIdentity"];
func.dependencies = ["SoulLinker"];
export default func;
