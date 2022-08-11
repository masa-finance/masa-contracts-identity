import { getEnvParams } from '../src/utils/EnvParams';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DeployFunction } from 'hardhat-deploy/dist/types';

let owner: SignerWithAddress;

const func: DeployFunction = async ({
  getNamedAccounts,
  deployments,
  ethers,
  network
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  [, owner] = await ethers.getSigners();
  const env = getEnvParams(network.name);

  const soulBoundTokenDeploymentResult = await deploy('SoulLinker', {
    from: deployer,
    args: [env.OWNER || owner.address],
    log: true
  });

  await ethers.getContractAt(
    'SoulLinker',
    soulBoundTokenDeploymentResult.address
  );
};

func.tags = ['SoulLinker'];
export default func;
