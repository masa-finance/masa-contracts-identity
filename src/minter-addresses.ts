/* eslint-disable no-console */
import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import {
  SoulboundIdentity,
  SoulboundIdentity__factory
} from "../typechain";

/**
 * main function
 */
async function main() {
  const [admin] = await ethers.getSigners();
  const chainId = await admin.getChainId();

  let soulboundIdentityAddresses;
  let totalMintedTokens = 0;

  if (chainId == 44787) {
    // alfajores
    soulboundIdentityAddresses = [
      "0xBDc0F2e51bedaB31258BE0c0bd8fCf141bccd193",
      "0x4e1c9E9ce5af7CB87E32f979B5288a1C6A6A1E5C",
      "0x514b35F067Bc78589986832d3c25caA9a4dD9fC7",
      "0xeFd998D31Ef7f0d54c6C960AEA29A8628CD704d8",
      "0x41a3cE7EA192D4b746CD7F2b7F8701aD4964C3c5",
      "0xD0f3C1361d8Fba40CbC85cC546c38511b510dedd",
      "0x1be6c425d17380D0BCF62099a27BE4e9c5cF8719",
      "0x1471A7d3914a38e7488111001e50eCc29D627166",
      "0xadAC98BB4f783Fea5478D496c777677521Ce305a"
    ];
  } else if (chainId == 5) {
    // goerli
    soulboundIdentityAddresses = [
      "0x270265B1c6b31ae53f75BC2f6a5D5F7f422BB9e8",
      "0xB10ddc662BD561f0B26A8B555e15C71430a74fAa",
      "0x83A5492f28CD7D2d5aA7A8b9c0Cf926f639Dd612",
      "0x6B87e5baB74c0b68e392817Ab2c6abf69DB0F5EC",
      "0x607af050D66AA9Bc54a051D7a0C68F254b6745Fc",
      "0xe7a4CaFA517cF82e90b42fB1cEE1437f4bb205F2",
      "0xF8625D0131116A13BC2e8d5953f6ed8A3F7C7353",
      "0x8aEB3A8D6bdFC68BFFe1aC03833D9522857f0db4"
    ];
  }

  console.log(
    "=============================================================================="
  );
  console.log(`ChainId: ${chainId}`);
  console.log(
    `SoulboundIdentity addresses count: ${soulboundIdentityAddresses.length}`
  );
  console.log(
    "=============================================================================="
  );

  for (let c = 0; c < soulboundIdentityAddresses.length; c++) {
    // create contract instances
    const soulboundIdentity: SoulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddresses[c],
      admin
    );

    const totalSupply = await soulboundIdentity.totalSupply();
    totalMintedTokens += totalSupply.toNumber();
    console.log(
      `SoulboundIdentity address ${soulboundIdentityAddresses[c]}, total supply: ${totalSupply}`
    );
  }

  console.log(
    "=============================================================================="
  );
  console.log(
    `Total supply of Identity SBTs: ${totalMintedTokens}`
  );
  console.log(
    "=============================================================================="
  );

  for (let c = 0; c < soulboundIdentityAddresses.length; c++) {
    console.log(
      `SoulboundIdentity address: ${soulboundIdentityAddresses[c]}`
    );
    // create contract instance
    const soulboundIdentity: SoulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddresses[c],
      admin
    );
    const totalSupply = await soulboundIdentity.totalSupply();
    console.log(`Name: ${await soulboundIdentity.name()}`);
    console.log(`Symbol: ${await soulboundIdentity.symbol()}`);
    console.log(`Total supply: ${totalSupply}`);

    /*for (let i = 7069; i < totalSupply.toNumber(); i++) {
      const eventFilter = soulboundIdentity.filters.Transfer(
        ethers.constants.AddressZero,
        null,
        i
      );
      const events = await soulboundIdentity.queryFilter(eventFilter);

      if (events && events.length > 0) {
        console.log(
          `${events[0].args.tokenId},${totalSupply},${events[0].args.to}`
        );
      } else {
        // New SBT smart contract
        const eventFilter = soulboundIdentityNew.filters.Mint(null, i);
        const events = await soulboundIdentityNew.queryFilter(eventFilter);

        if (events && events.length > 0) {
          console.log(
            `${events[0].args._tokenId},${totalSupply},${events[0].args._owner}`
          );
        }
      }
    }*/
    console.log(
      "=============================================================================="
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
