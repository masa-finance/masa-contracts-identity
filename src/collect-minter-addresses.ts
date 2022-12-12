/* eslint-disable no-console */
import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import {
  SoulName,
  SoulName__factory,
} from "../typechain";

/**
 * main function
 */
async function main() {
  const [admin] = await ethers.getSigners();
  const chainId = await admin.getChainId();

  let soulNameAddress;
  if (chainId == 44787) {
    // alfajores
    soulNameAddress = "0x39A600828FdA30C77B0222167e161F5933Ccd2BE";
  } else if (chainId == 5) {
    // goerli
    soulNameAddress = "0x3f80F551459440524caeC9fce97fFB4B3F6BFFC0";
  }


  console.log(
    "=============================================================================="
  );
  console.log(`Account address: ${admin.address}`);
  console.log(`ChainId: ${chainId}`);

  console.log("");

  console.log(`SoulName address:              ${soulNameAddress}`);
  console.log("");

  // create contract instances
  const soulName: SoulName = SoulName__factory.connect(soulNameAddress, admin);

  console.log("");

  const totalSupply = await soulName.totalSupply();
  console.log(`Total supply: ${totalSupply.toNumber()}`);
  for (let i = 0; i < totalSupply.toNumber(); i++) {
    const eventFilter = soulName.filters.Transfer(ethers.constants.AddressZero, null, i);
    const events = await soulName.queryFilter(eventFilter);

    console.log(`${events[0].args.tokenId},${events[0].args.to}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
