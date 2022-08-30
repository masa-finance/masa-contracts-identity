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

  const soulboundIdentity = await deployments.get("SoulboundIdentity");

  const soulNameDeploymentResult = await deploy("SoulName", {
    from: deployer,
    args: [env.OWNER || owner.address, soulboundIdentity.address, ".soul", ""],
    log: true
  });

  const soulboundIdentityContract = await ethers.getContractAt(
    "SoulboundIdentity",
    soulboundIdentity.address
  );
  const soulNameContract = await ethers.getContractAt(
    "SoulName",
    soulNameDeploymentResult.address
  );

  // we set the soulName contract in soulboundIdentity and we add soulboundIdentity as soulName minter
  const signer = env.OWNER
    ? new ethers.Wallet(
        getPrivateKey(network.name),
        ethers.getDefaultProvider(network.name)
      )
    : owner;

  const MINTER_ROLE = await soulNameContract.MINTER_ROLE();
  await soulboundIdentityContract
    .connect(signer)
    .setSoulNameContract(soulNameDeploymentResult.address);
  await soulNameContract
    .connect(signer)
    .grantRole(MINTER_ROLE, soulboundIdentityContract.address);

  await ethers.getContractAt("SoulName", soulNameDeploymentResult.address);
};

func.tags = ["SoulName"];
func.dependencies = ["SoulboundIdentity"];
export default func;
