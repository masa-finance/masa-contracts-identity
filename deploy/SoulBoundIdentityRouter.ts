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

  const soulBoundIdentityContract = await ethers.getContractAt(
    "SoulBoundIdentity",
    soulBoundIdentity.address,
    owner
  );
  const soulBoundNameContract = await ethers.getContractAt(
    "SoulBoundName",
    soulBoundName.address,
    owner
  );

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

  // we grant the MINTER_ROLE to the SoulBoundIdentityRouter
  const MINTER_ROLE_IDENTITY = await soulBoundIdentityContract.MINTER_ROLE();
  const MINTER_ROLE_NAME = await soulBoundNameContract.MINTER_ROLE();
  await soulBoundIdentityContract
    .connect(owner)
    .grantRole(
      MINTER_ROLE_IDENTITY,
      soulBoundIdentityRouterDeploymentResult.address
    );
  await soulBoundNameContract
    .connect(owner)
    .grantRole(
      MINTER_ROLE_NAME,
      soulBoundIdentityRouterDeploymentResult.address
    );

  await ethers.getContractAt(
    "SoulBoundIdentityRouter",
    soulBoundIdentityRouterDeploymentResult.address
  );
};

func.tags = ["SoulBoundIdentityRouter"];
func.dependencies = ["SoulBoundIdentity", "SoulBoundName"];
export default func;
