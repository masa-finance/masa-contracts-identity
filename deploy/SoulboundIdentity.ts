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
  const baseUri = `${env.BASE_URI}/identity/`;

  const soulLinker = await deployments.get("SoulLinker");

  const SoulboundIdentityDeploymentResult = await deploy("SoulboundIdentity", {
    from: deployer,
    args: [env.OWNER || owner.address, soulLinker.address, baseUri],
    log: true
  });
};

func.tags = ["SoulboundIdentity"];
func.dependencies = ["SoulLinker"];
export default func;
