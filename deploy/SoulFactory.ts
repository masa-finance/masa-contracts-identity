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

  const corn = await deployments.get("CORN");
  const soulboundIdentity = await deployments.get("SoulboundIdentity");

  const SoulFactoryDeploymentResult = await deploy("SoulFactory", {
    from: deployer,
    args: [
      env.OWNER || owner.address,
      soulboundIdentity.address,
      "5000000", // 5 USDC, with 6 decimals
      "3000000", // 3 USDC, with 6 decimals
      ethers.constants.AddressZero,
      corn.address,
      env.OWNER || owner.address
    ],
    log: true
  });

  // TODO: Add to SoulFactory the MINTER_ROLE role to SoulboundIdentity

  await ethers.getContractAt(
    "SoulFactory",
    SoulFactoryDeploymentResult.address
  );
};

func.tags = ["SoulFactory"];
func.dependencies = ["CORN", "SoulboundIdentity"];
export default func;
