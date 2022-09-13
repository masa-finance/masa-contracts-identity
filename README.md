# Masa Soulbound NFTs

## Contract Deployments

### Celo: Alfajores

- `CORN`: [`0x9A138722AFEdBf38B54d33A88eF903a5c16E6455`](https://alfajores-blockscout.celo-testnet.org/address/0x9A138722AFEdBf38B54d33A88eF903a5c16E6455/transactions)
- `SoulboundCreditReport`: [`0xA1BF97df30FDBf6c7037ecB0719E78bE170F96b6`](https://alfajores-blockscout.celo-testnet.org/address/0xA1BF97df30FDBf6c7037ecB0719E78bE170F96b6/transactions)
- `SoulboundIdentity`: [`0xBDc0F2e51bedaB31258BE0c0bd8fCf141bccd193`](https://alfajores-blockscout.celo-testnet.org/address/0xBDc0F2e51bedaB31258BE0c0bd8fCf141bccd193/transactions)
- `SoulName`: [`0x4f9CaE6dB46Fcbc261F3524aF2A835858F75Efb0`](https://alfajores-blockscout.celo-testnet.org/address/0x4f9CaE6dB46Fcbc261F3524aF2A835858F75Efb0/transactions)
- `SoulLinker`: [`0x22988b7eaccCFa595B9e750c0D147Da07e5d59ED`](https://alfajores-blockscout.celo-testnet.org/address/0x22988b7eaccCFa595B9e750c0D147Da07e5d59ED/transactions)
- `SoulFactory`: [`0x850a2821f772434e561D2EFdcE487C05cE2699Ea`](https://alfajores-blockscout.celo-testnet.org/address/0x850a2821f772434e561D2EFdcE487C05cE2699Ea/transactions)

### Goerli test network

- `CORN`: [`0xF43e55812AA6457c86D631059C2544251ED8F72B`](https://goerli.etherscan.io/address/0xF43e55812AA6457c86D631059C2544251ED8F72B)
- `SoulboundCreditReport`: [`0x050c3b47ABe7f8999175591c79D9422Dad89340D`](https://goerli.etherscan.io/address/0x050c3b47ABe7f8999175591c79D9422Dad89340D)
- `SoulboundIdentity`: [`0x8aEB3A8D6bdFC68BFFe1aC03833D9522857f0db4`](https://goerli.etherscan.io/address/0x8aEB3A8D6bdFC68BFFe1aC03833D9522857f0db4)
- `SoulName`: [`0x9A89eaEFf5eBfeBCcDA9E446230A4739f2329967`](https://goerli.etherscan.io/address/0x9A89eaEFf5eBfeBCcDA9E446230A4739f2329967)
- `SoulLinker`: [`0x6d23537601CF3c1159aCce9e52Cf0E197846FF34`](https://goerli.etherscan.io/address/0x6d23537601CF3c1159aCce9e52Cf0E197846FF34)
- `SoulFactory`: [`0x6029bFFCFf6662F8dC0AfFfA0B86B95309eEbed4`](https://goerli.etherscan.io/address/0x6029bFFCFf6662F8dC0AfFfA0B86B95309eEbed4)

#### Configuration

- `Owner`: [`0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F`](https://alfajores-blockscout.celo-testnet.org/address/0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F/transactions)

Only the `owner` is allowed to mint SBTs.

- `BASE_URI`: https://dev.api.masa.finance/v1.0

The base url for the Metadata url that is beeing generated from the contract

## Roles

- `deployer`: Deploys the contract, has no rights after everything has properlty handed over to other roles
- `owner`: Delegated to the Masa Service account inside the Masa API. It has the rights to mint tokens to customers
  wallets.

## Interface

- [Abstract Soulbound Token Definition](docs/tokens/SBT.md)
- [Abstract Non-Fungible Token Definition](docs/tokens/NFT.md)
- [Soulbound Identity Definition](docs/SoulboundIdentity.md)
- [Soulbound Credit Report Definition](docs/SoulboundCreditReport.md)
- [Soul Name Definition](docs/SoulName.md)
- [Soul Linker Definition](docs/SoulLinker.md)

## Deployment

### Preparations

* Set `DEPLOYER_PRIVATE_KEY` to the deployers private key in `.env.{network}.secret`
* Set `COINMARKETCAP_API_KEY` to the Infura API key in `.env`, if needed
* Set `INFURA_API_KEY` to the Infura API key in `.env`, if needed
* Set `ETHERSCAN_API_KEY` to the Infura API key in `.env`, if needed

### Deploy

Run: `yarn deploy --network {network}` to deploy.

## Installation and usage

Installing via `npm` package:

```bash
npm i @masa-finance/masa-contracts-identity
```

Import in your project:

```typescript
import { SoulboundIdentity, SoulboundIdentity__factory } from "@masa-finance/masa-contracts-identity";

const soulboundIdentity: SoulboundIdentity = SoulboundIdentity__factory.connect(
  <address>, // address of the deployed contract
  <provider> // web3 provider
);
console.log(await soulboundIdentity.symbol());
```

## Generation of a new release

From a clean `main` branch you can run the release task bumping the version accordingly based on semantic versioning:
```bash
yarn release
```

The task does the following:

* Bumps the project version in `package.json`
* Creates a Git tag
* Commits and pushes everything
* Creates a GitHub release with commit messages as description
* Git tag push will trigger a GitHub Action workflow to do a `npm` release

For the GitHub releases steps a GitHub personal access token, exported as `GITHUB_TOKEN` is required. You can add this environment variable to the `.env` file. [Setup](https://github.com/release-it/release-it#github-releases)
