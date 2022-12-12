/* eslint-disable no-console */
import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { SoulName, SoulName__factory } from "../typechain";

/**
 * main function
 */
async function main() {
  const [admin] = await ethers.getSigners();
  const chainId = await admin.getChainId();

  let soulNameAddresses;
  if (chainId == 44787) {
    // alfajores
    soulNameAddresses = ["0x39A600828FdA30C77B0222167e161F5933Ccd2BE"];
  } else if (chainId == 5) {
    // goerli
    soulNameAddresses = [
      "0xB4Ca4a32199520F726EDD680042A8d9d26B4de06",
      "0x15987A0417D14cc6f3554166bCB4A590f6891B18",
      "0xf4B9De884175f1b2A6A383a64D02E88C850e94fF",
      "0x1b8333B8b87978A789482E391101aE41A9fB53FF",
      "0xE465bE522317753B432a31173430fA366F108CC1",
      "0xF8A4cE70d457F6343B77A17806C140bc25575Dc8",
      "0x3f80F551459440524caeC9fce97fFB4B3F6BFFC0",
      "0x9A89eaEFf5eBfeBCcDA9E446230A4739f2329967"
    ];
  }

  console.log(
    "=============================================================================="
  );
  console.log(`Account address: ${admin.address}`);
  console.log(`ChainId: ${chainId}`);

  console.log("");

  console.log(`SoulName addresses:              ${soulNameAddresses}`);
  console.log("");

  for (let c = 0; c < soulNameAddresses.length; c++) {
    console.log("");

    // create contract instances
    console.log(`SoulName address:                ${soulNameAddresses[c]}`);
    const soulName: SoulName = SoulName__factory.connect(
      soulNameAddresses[c],
      admin
    );

    const totalSupply = await soulName.totalSupply();
    console.log(`Total supply: ${totalSupply.toNumber()}`);
    for (let i = 0; i < totalSupply.toNumber(); i++) {
      const eventFilter = soulName.filters.Transfer(
        ethers.constants.AddressZero,
        null,
        i
      );
      const events = await soulName.queryFilter(eventFilter);

      console.log(`${events[0].args.tokenId},${events[0].args.to}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
