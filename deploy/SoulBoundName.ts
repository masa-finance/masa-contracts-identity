import { getEnvParams } from "../src/utils/EnvParams";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";

let owner: SignerWithAddress;

const func: DeployFunction = async ({
  getNamedAccounts,
  deployments,
  ethers,
  network
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  [, owner] = await ethers.getSigners();
  const env = getEnvParams(network.name);

  const soulBoundIdentity = await deployments.get("SoulBoundIdentity");

  const soulBoundNameDeploymentResult = await deploy("SoulBoundName", {
    from: deployer,
    args: [env.OWNER || owner.address, soulBoundIdentity.address, ".sol", ""],
    log: true
  });

  await ethers.getContractAt(
    "SoulBoundName",
    soulBoundNameDeploymentResult.address
  );
};

func.tags = ["SoulBoundName"];
func.dependencies = ["SoulBoundIdentity"];
export default func;
