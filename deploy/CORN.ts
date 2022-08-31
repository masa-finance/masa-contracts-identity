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

  const cornDeploymentResult = await deploy("CORN", {
    from: deployer,
    args: [],
    log: true
  });

  const corn = await ethers.getContractAt("CORN", cornDeploymentResult.address);
  await corn.transfer(
    env.OWNER || owner.address,
    ethers.utils.parseEther("1000")
  );
  console.log(await corn.balanceOf(env.OWNER || owner.address));
};

func.tags = ["CORN"];
export default func;
