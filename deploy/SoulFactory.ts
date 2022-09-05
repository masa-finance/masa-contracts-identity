import { getEnvParams, getPrivateKey } from "../src/utils/EnvParams";
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
  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");

  const SoulFactoryDeploymentResult = await deploy("SoulFactory", {
    from: deployer,
    args: [
      env.OWNER || owner.address,
      soulboundIdentityDeployed.address,
      "5000000", // 5 USDC, with 6 decimals
      "3000000", // 3 USDC, with 6 decimals
      ethers.constants.AddressZero,
      corn.address,
      env.OWNER || owner.address
    ],
    log: true
  });

  const soulboundIdentity = await ethers.getContractAt(
    "SoulboundIdentity",
    soulboundIdentityDeployed.address
  );

  // we add soulFactory as soulboundIdentity minter
  const signer = env.OWNER
    ? new ethers.Wallet(
        getPrivateKey(network.name),
        ethers.getDefaultProvider(network.name)
      )
    : owner;

  const MINTER_ROLE = await soulboundIdentity.MINTER_ROLE();
  await soulboundIdentity
    .connect(signer)
    .grantRole(MINTER_ROLE, SoulFactoryDeploymentResult.address);
};

func.tags = ["SoulFactory"];
func.dependencies = ["CORN", "SoulboundIdentity", "SoulName"];
export default func;
