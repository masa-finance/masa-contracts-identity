/* eslint-disable no-console */
import '@nomiclabs/hardhat-ethers';
import { ethers } from 'hardhat';

/**
 * main function
 */
async function main() {
  const [owner] = await ethers.getSigners();
  const chainId = await owner.getChainId();

  console.log('==============================================================================');
  console.log(`Account address: ${owner.address}`);
  console.log(`ChainId: ${chainId}`);

  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
