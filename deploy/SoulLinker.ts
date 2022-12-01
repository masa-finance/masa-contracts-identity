import hre from "hardhat";
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

  // const currentNonce: number = await ethers.provider.getTransactionCount(deployer);
  // to solve REPLACEMENT_UNDERPRICED, when needed

  [, owner] = await ethers.getSigners();
  const env = getEnvParams(network.name);

  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");
  const soulboundCreditScoreDeployed = await deployments.get(
    "SoulboundCreditScore"
  );
  const soulbound2FADeployed = await deployments.get("Soulbound2FA");

  const constructorArguments = [
    env.OWNER || owner.address,
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

  const signer = env.OWNER
    ? new ethers.Wallet(
        getPrivateKey(network.name),
        ethers.getDefaultProvider(network.name)
      )
    : owner;

  const soulLinker = await ethers.getContractAt(
    "SoulLinker",
    soulLinkerDeploymentResult.address
  );

  await soulLinker
    .connect(signer)
    .addLinkedSBT(soulboundCreditScoreDeployed.address);

  await soulLinker.connect(signer).addLinkedSBT(soulbound2FADeployed.address);
};

func.tags = ["SoulLinker"];
func.dependencies = [
  "SoulboundIdentity",
  "SoulboundCreditScore",
  "Soulbound2FA"
];
export default func;
