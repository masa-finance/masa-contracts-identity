import hre from "hardhat";
import { getEnvParams, getPrivateKey } from "../src/utils/EnvParams";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";

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

  // const currentNonce: number = await ethers.provider.getTransactionCount(deployer);
  // to solve REPLACEMENT_UNDERPRICED, when needed

  [, admin] = await ethers.getSigners();
  const env = getEnvParams(network.name);

  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");
  const soulboundCreditReportDeployed = await deployments.get(
    "SoulboundCreditReport"
  );

  const constructorArguments = [
    env.ADMIN || admin.address,
    soulboundIdentityDeployed.address
  ];

  const soulLinkerDeploymentResult = await deploy("SoulLinker", {
    from: deployer,
    args: constructorArguments,
    log: true
    // nonce: currentNonce + 1 // to solve REPLACEMENT_UNDERPRICED, when needed
  });

  // verify contract with etherscan, if its not a local network
  if (network.name == "mainnet" || network.name == "goerli") {
    try {
      await hre.run("verify:verify", {
        address: soulLinkerDeploymentResult.address,
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

  const signer = env.ADMIN
    ? new ethers.Wallet(
        getPrivateKey(network.name),
        ethers.getDefaultProvider(network.name)
      )
    : admin;

  const soulLinker = await ethers.getContractAt(
    "SoulLinker",
    soulLinkerDeploymentResult.address
  );

  await soulLinker
    .connect(signer)
    .addLinkedSBT(soulboundCreditReportDeployed.address);
};

func.tags = ["SoulLinker"];
func.dependencies = ["SoulboundIdentity", "SoulboundCreditReport"];
export default func;
