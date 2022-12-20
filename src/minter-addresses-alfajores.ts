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

  // list of accounts that have minted, without duplicates
  const accounts = {};

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
    const soulboundIdentity: SoulName = SoulName__factory.connect(
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
  console.log(`Total supply of Identity SBTs: ${totalMintedTokens}`);
  console.log(
    "=============================================================================="
  );

  for (let c = 0; c < soulboundIdentityAddresses.length; c++) {
    console.log(`SoulboundIdentity address: ${soulboundIdentityAddresses[c]}`);
    // create contract instance
    const soulboundIdentity: SoulName = SoulName__factory.connect(
      soulboundIdentityAddresses[c],
      admin
    );
    const totalSupply = await soulboundIdentity.totalSupply();
    console.log(`Name: ${await soulboundIdentity.name()}`);
    console.log(`Symbol: ${await soulboundIdentity.symbol()}`);
    console.log(`Total supply: ${totalSupply}`);

    let isEnded = false;
    let i = 0;

    while (!isEnded) {
      const eventFilter = soulboundIdentity.filters.Transfer(
        ethers.constants.AddressZero,
        null,
        i
      );
      const events = await soulboundIdentity.queryFilter(eventFilter);

      if (events.length != 0) {
        console.log(
          `${events[0].args.tokenId},${totalSupply},${events[0].args.to}`
        );
        if (accounts[events[0].args.to] == null) {
          accounts[events[0].args.to] = true;
        }
      } else {
        isEnded = true;
      }
      i++;
    }
    console.log(
      "=============================================================================="
    );
  }

  const accountKeys = Object.keys(accounts);
  for (let i = 0; i < accountKeys.length; i++) {
    console.log(accountKeys[i])
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
