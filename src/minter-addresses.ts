/* eslint-disable no-console */
import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { SoulboundIdentity, SoulboundIdentity__factory } from "../typechain";
import { GraphQLClient, gql } from "graphql-request";
import { getSecretParam } from "./utils/EnvParams";

const eventQuery = gql`
  query (
    $network: EthereumNetwork!
    $contract: String!
    $event: String!
    $limit: Int!
    $offset: Int!
  ) {
    ethereum(network: $network) {
      smartContractEvents(
        options: { asc: "block.height", limit: $limit, offset: $offset }
        smartContractEvent: { is: $event }
        smartContractAddress: { is: $contract }
      ) {
        block {
          height
          timestamp {
            time
          }
        }
        arguments {
          value
          argument
        }
      }
    }
  }
`;

const getMinterAddresses = async (
  chainId: number,
  smartContractAddress: string,
  event: string
) => {
  const BITQUERY_ENDPOINT = "https://graphql.bitquery.io/";
  const bitqueryApiKey = getSecretParam("BITQUERY_API_KEY");

  const graphQLClient = new GraphQLClient(BITQUERY_ENDPOINT, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": bitqueryApiKey
    }
  });

  const data = await graphQLClient.request(eventQuery, {
    network: chainId == 5 ? "goerli" : "",
    contract: smartContractAddress,
    event: event,
    limit: 10000,
    offset: 0
  });
  return data;
};

/**
 * main function
 */
async function main() {
  const [admin] = await ethers.getSigners();
  const chainId = await admin.getChainId();

  let soulboundIdentityAddresses;
  let totalMintedTokens = 0;

  if (chainId == 5) {
    // goerli
    soulboundIdentityAddresses = [
      ["0x270265B1c6b31ae53f75BC2f6a5D5F7f422BB9e8", "Mint"],
      ["0xB10ddc662BD561f0B26A8B555e15C71430a74fAa", "Mint"],
      ["0x83A5492f28CD7D2d5aA7A8b9c0Cf926f639Dd612", "Mint"],
      ["0x6B87e5baB74c0b68e392817Ab2c6abf69DB0F5EC", "Transfer"],
      ["0x607af050D66AA9Bc54a051D7a0C68F254b6745Fc", "Transfer"],
      ["0xe7a4CaFA517cF82e90b42fB1cEE1437f4bb205F2", "Transfer"],
      ["0xF8625D0131116A13BC2e8d5953f6ed8A3F7C7353", "Transfer"],
      ["0x8aEB3A8D6bdFC68BFFe1aC03833D9522857f0db4", "Transfer"]
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
    const soulboundIdentity: SoulboundIdentity =
      SoulboundIdentity__factory.connect(
        soulboundIdentityAddresses[c][0],
        admin
      );

    const totalSupply = await soulboundIdentity.totalSupply();
    totalMintedTokens += totalSupply.toNumber();
    console.log(
      `SoulboundIdentity address ${soulboundIdentityAddresses[c][0]}, total supply: ${totalSupply}`
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
    console.log(
      `SoulboundIdentity address: ${soulboundIdentityAddresses[c][0]}`
    );
    // create contract instance
    const soulboundIdentity: SoulboundIdentity =
      SoulboundIdentity__factory.connect(
        soulboundIdentityAddresses[c][0],
        admin
      );
    const totalSupply = await soulboundIdentity.totalSupply();
    console.log(`Name: ${await soulboundIdentity.name()}`);
    console.log(`Symbol: ${await soulboundIdentity.symbol()}`);
    console.log(`Total supply: ${totalSupply}`);

    const data = await getMinterAddresses(
      chainId,
      soulboundIdentityAddresses[c][0],
      soulboundIdentityAddresses[c][1]
    );
    console.log(data);

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
