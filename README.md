# Masa Soul Bound NFTs

## Contract Deployments

### Celo: Alfajores

- `SoulBoundCreditReport`: [`0xa8c050e7ba408165df4721fa32976a6146427dbB`](https://alfajores-blockscout.celo-testnet.org/address/0xa8c050e7ba408165df4721fa32976a6146427dbB/transactions)
- `SoulBoundIdentity`: [`0x41a3cE7EA192D4b746CD7F2b7F8701aD4964C3c5`](https://alfajores-blockscout.celo-testnet.org/address/0x41a3cE7EA192D4b746CD7F2b7F8701aD4964C3c5/transactions)
- `SoulName`: [`0x39A600828FdA30C77B0222167e161F5933Ccd2BE`](https://alfajores-blockscout.celo-testnet.org/address/0x39A600828FdA30C77B0222167e161F5933Ccd2BE/transactions)
- `SoulLinker`: [`0xc67aB8e6612f794aFc532078dAff2deF35738968`](https://alfajores-blockscout.celo-testnet.org/address/0xc67aB8e6612f794aFc532078dAff2deF35738968/transactions)

### Rinkeby test network

- `SoulBoundCreditReport`: [`0xc1758aa89F67D0d78b928796d5d425D5649770CA`](https://rinkeby.etherscan.io/address/0xc1758aa89F67D0d78b928796d5d425D5649770CA)
- `SoulBoundIdentity`: [`0x42ff589E5B6cf65D846ccFa22C7bAeB9C6dA0548`](https://rinkeby.etherscan.io/address/0x42ff589E5B6cf65D846ccFa22C7bAeB9C6dA0548)
- `SoulName`: [`0x06Ff60a3dBcfB907dbF670090807AE93b0169435`](https://rinkeby.etherscan.io/address/0x06Ff60a3dBcfB907dbF670090807AE93b0169435)
- `SoulLinker`: [`0x3d039EA3d6Bd1e7369f55e0460d1AF507A9235C6`](https://rinkeby.etherscan.io/address/0x3d039EA3d6Bd1e7369f55e0460d1AF507A9235C6)

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

- [Abstract Soul Bound Token Definition](docs/SoulBoundToken.md)
- [Soul Bound Identity Definition](docs/SoulBoundIdentity.md)
- [Soul Bound Credit Report Definition](docs/SoulBoundCreditReport.md)
- [Soul Linker Definition](docs/SoulLinker.md)

## Deployment

### Preparations

* Set `DEPLOYER_PRIVATE_KEY` to the deployers private key in `.env.{network}.secret`
* Set `INFURA_API_KEY` to the Infura API key in `.env.{network}.secret`, if needed

### Deploy

Run: `yarn deploy --network {network}` to deploy.

## Installation and usage

Installing via `npm` package:

```bash
npm i @masa-finance/masa-contracts-identity
```

Import in your project:

```typescript
import { SoulBoundIdentity, SoulBoundIdentity__factory } from "@masa-finance/masa-contracts-identity";

const soulBoundIdentity: SoulBoundIdentity = SoulBoundIdentity__factory.connect(
      <address> // address of the deployed contract,
      <provider> // web3 provider
    );
console.log(await soulBoundIdentity.symbol());
```
