/* eslint-disable no-console */
import '@nomiclabs/hardhat-ethers';
import { deployments, ethers } from 'hardhat';

/**
 * main function
 */
async function main() {
  const [owner] = await ethers.getSigners();
  const chainId = await owner.getChainId();

  const masaDeployed = await deployments.get("MASA");
  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");
  const soulboundCreditReportDeployed = await deployments.get("SoulboundCreditReport");
  const soulNameDeployed = await deployments.get("SoulName");
  const soulStoreDeployed = await deployments.get("SoulStore");
  const soulLinkerDeployed = await deployments.get("SoulLinker");

  console.log('==============================================================================');
  console.log(`Account address: ${owner.address}`);
  console.log(`ChainId: ${chainId}`);

  console.log('');

  console.log(`MASA address:                  ${masaDeployed.address}`);
  console.log(`SoulboundIdentity address:     ${soulboundIdentityDeployed.address}`);
  console.log(`SoulboundCreditReport address: ${soulboundCreditReportDeployed.address}`);
  console.log(`SoulName address:              ${soulNameDeployed.address}`);
  console.log(`SoulStore address:             ${soulStoreDeployed.address}`);
  console.log(`SoulLinker address:            ${soulLinkerDeployed.address}`);

  console.log('==============================================================================');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
