/* eslint-disable no-console */
import "@nomiclabs/hardhat-ethers";
import hre from "hardhat";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { getEnvParams } from "./EnvParams";
import ReferenceSBTSelfSovereignArtifact from "../artifacts/contracts/reference/ReferenceSBTSelfSovereign.sol/ReferenceSBTSelfSovereign.json";
import { ReferenceSBTSelfSovereign } from "../typechain";
import { deployContract } from "@nomiclabs/hardhat-ethers/types";

/**
 * main function
 */
async function main() {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const env = getEnvParams(network.name);

  console.log(
    `Deploying to ${network.name} (chainId: ${network.config.chainId})`
  );
  console.log(`Deploying with the account: ${deployer}`);

  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");

  const constructorArguments = [
    env.ADMIN,
    "Cloud Bound Token",
    "CBT",
    "https://arweave.net/lykHq8B2CfIH9R0ox69IaK1kFZVCndxuIKXRyLaK59k",
    soulboundIdentityDeployed.address,
    [
      env.SWAP_ROUTER,
      env.WETH_TOKEN,
      env.USDC_TOKEN,
      env.MASA_TOKEN,
      env.PROJECTFEE_RECEIVER,
      env.PROTOCOLFEE_RECEIVER || ethers.constants.AddressZero,
      env.PROTOCOLFEE_AMOUNT || 0,
      env.PROTOCOLFEE_PERCENT || 0
    ],
    1 // maxMints
  ];

  console.log(constructorArguments);

  const sssbt = await deploy("ReferenceSBTSelfSovereign", {
    from: deployer,
    args: constructorArguments,
    log: true
  });

  console.log(`ReferenceSBTSelfSovereign deployed to: ${sssbt.address}`);

  // Verify contract
  try {
    await hre.run("verify:verify", {
      address: sssbt.address,
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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
