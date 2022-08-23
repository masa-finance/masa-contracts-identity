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

  const soulboundIdentity = await deployments.get("SoulboundIdentity");

  const soulboundNameDeploymentResult = await deploy("SoulName", {
    from: deployer,
    args: [env.OWNER || owner.address, soulboundIdentity.address, ".sol", ""],
    log: true
  });

  await ethers.getContractAt(
    "SoulboundIdentity",
    soulboundNameDeploymentResult.address
  );

  const soulboundIdentityContract = await ethers.getContractAt(
    "SoulboundIdentity",
    soulboundIdentity.address
  );

  await soulboundIdentityContract
    .connect(owner)
    .setSoulNameContract(soulboundNameDeploymentResult.address);
};

func.tags = ["SoulName"];
func.dependencies = ["SoulboundIdentity"];
export default func;
