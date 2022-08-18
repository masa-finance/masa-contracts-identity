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
  const soulBoundName = await deployments.get("SoulBoundName");

  const soulBoundIdentityRouterDeploymentResult = await deploy(
    "SoulBoundIdentityRouter",
    {
      from: deployer,
      args: [
        env.OWNER || owner.address,
        soulBoundIdentity.address,
        soulBoundName.address
      ],
      log: true
    }
  );

  await ethers.getContractAt(
    "SoulBoundIdentityRouter",
    soulBoundIdentityRouterDeploymentResult.address
  );
};

func.tags = ["SoulBoundIdentityRouter"];
func.dependencies = ["SoulBoundIdentity", "SoulBoundName"];
export default func;
