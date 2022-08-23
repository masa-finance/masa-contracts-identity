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
  const soulName = await deployments.get("SoulName");

  const soulBoundIdentityContract = await ethers.getContractAt(
    "SoulBoundIdentity",
    soulBoundIdentity.address,
    owner
  );
  const soulNameContract = await ethers.getContractAt(
    "SoulName",
    soulName.address,
    owner
  );

  const soulBoundIdentityRouterDeploymentResult = await deploy(
    "SoulBoundIdentityRouter",
    {
      from: deployer,
      args: [
        env.OWNER || owner.address,
        soulBoundIdentity.address,
        soulName.address
      ],
      log: true
    }
  );

  // we grant the MINTER_ROLE to the SoulBoundIdentityRouter
  const MINTER_ROLE_IDENTITY = await soulBoundIdentityContract.MINTER_ROLE();
  const MINTER_ROLE_NAME = await soulNameContract.MINTER_ROLE();
  await soulBoundIdentityContract
    .connect(owner)
    .grantRole(
      MINTER_ROLE_IDENTITY,
      soulBoundIdentityRouterDeploymentResult.address
    );
  await soulNameContract
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
func.dependencies = ["SoulBoundIdentity", "SoulName"];
export default func;
