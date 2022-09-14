import hre from "hardhat";
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

  // const currentNonce: number = await ethers.provider.getTransactionCount(deployer);
  // to solve REPLACEMENT_UNDERPRICED, when needed

  [, owner] = await ethers.getSigners();
  const env = getEnvParams(network.name);

  const cornDeploymentResult = await deploy("CORN", {
    from: deployer,
    args: [],
    log: true
    // nonce: currentNonce + 1 // to solve REPLACEMENT_UNDERPRICED, when needed
  });

  // verify contract with etherscan, if its not a local network
  if (network.name == "mainnet" || network.name == "goerli") {
    await hre.run("verify:verify", {
      address: cornDeploymentResult.address,
      constructorArguments: []
    });
  }

  const corn = await ethers.getContractAt("CORN", cornDeploymentResult.address);
  await corn.transfer(
    env.OWNER || owner.address,
    ethers.utils.parseEther("1000")
  );
};

func.tags = ["CORN"];
export default func;
