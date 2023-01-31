import hre from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { getEnvParams, getPrivateKey } from "../src/EnvParams";

let admin: SignerWithAddress;

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

  [, admin] = await ethers.getSigners();
  const env = getEnvParams(network.name);

  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");

  const constructorArguments = [
    env.ADMIN || admin.address,
    soulboundIdentityDeployed.address,
    ".soul",
    env.SOUL_NAME_CONTRACT_URI
  ];

  if (
    network.name === "mainnet" ||
    network.name === "goerli" ||
    network.name === "hardhat"
  ) {
    const soulNameDeploymentResult = await deploy("SoulName", {
      from: deployer,
      args: constructorArguments,
      log: true
    });

    // verify contract with etherscan, if its not a local network
    if (network.name === "mainnet" || network.name === "goerli") {
      try {
        await hre.run("verify:verify", {
          address: soulNameDeploymentResult.address,
          constructorArguments
        });
      } catch (error) {
        if (
          !error.message.includes("Contract source code already verified") &&
          !error.message.includes("Reason: Already Verified")
        ) {
          throw error;
        }
      }
    }

    if (network.name === "hardhat") {
      const soulboundIdentity = await ethers.getContractAt(
        "SoulboundIdentity",
        soulboundIdentityDeployed.address
      );
      const soulName = await ethers.getContractAt(
        "SoulName",
        soulNameDeploymentResult.address
      );

      // we set the soulName contract in soulboundIdentity and we add soulboundIdentity as soulName minter
      const signer = env.ADMIN
        ? new ethers.Wallet(
            getPrivateKey(network.name),
            ethers.provider
          )
        : admin;

      const MINTER_ROLE = await soulName.MINTER_ROLE();
      await soulboundIdentity
        .connect(signer)
        .setSoulName(soulNameDeploymentResult.address);
      await soulName
        .connect(signer)
        .grantRole(MINTER_ROLE, soulboundIdentityDeployed.address);
    }
  }
};

func.skip = async ({ network }) => {
  return (
    network.name !== "mainnet" &&
    network.name !== "goerli" &&
    network.name !== "hardhat"
  );
};
func.tags = ["SoulName"];
func.dependencies = ["SoulboundIdentity"];
export default func;
