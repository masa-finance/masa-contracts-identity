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
  const baseUri = `${env.BASE_URI}/credit-report/`;

  const soulLinker = await deployments.get('SoulLinker');

  const soulBoundTokenDeploymentResult = await deploy('SoulBoundCreditReport', {
    from: deployer,
    args: [env.OWNER || owner.address, soulLinker.address, baseUri],
    log: true
  });

  await ethers.getContractAt(
    'SoulBoundCreditReport',
    soulBoundTokenDeploymentResult.address
  );
};

func.tags = ['SoulBoundCreditReport'];
func.dependencies = ['SoulLinker'];
export default func;
