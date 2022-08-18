# Masa Soul Bound NFTs

## Contract Deployments

### Celo: Alfajores

- `SoulBoundCreditReport`: [`0x16C2f2c5F3aea4b70595Ea45693784247f951aD1`](https://alfajores-blockscout.celo-testnet.org/address/0x16C2f2c5F3aea4b70595Ea45693784247f951aD1/transactions)
- `SoulBoundIdentity`: [`0xD0f3C1361d8Fba40CbC85cC546c38511b510dedd`](https://alfajores-blockscout.celo-testnet.org/address/0xD0f3C1361d8Fba40CbC85cC546c38511b510dedd/transactions)
- `SoulBoundName`: [`0xef0E52AF65B56f38355AcfF2D2aA047D4FF0a5a9`](https://alfajores-blockscout.celo-testnet.org/address/0xef0E52AF65B56f38355AcfF2D2aA047D4FF0a5a9/transactions)
- `SoulLinker`: [`0x5D3e2fd5eB8685f964d0fAb2B0F34436bFcB3A42`](https://alfajores-blockscout.celo-testnet.org/address/0x5D3e2fd5eB8685f964d0fAb2B0F34436bFcB3A42/transactions)

### Rinkeby test network

- `SoulBoundCreditReport`: [`0x1471A7d3914a38e7488111001e50eCc29D627166`](https://rinkeby.etherscan.io/address/0x1471A7d3914a38e7488111001e50eCc29D627166)
- `SoulBoundIdentity`: [`0xd9B0185D3865727fEaB5760bF13dde39b00263e5`](https://rinkeby.etherscan.io/address/0xd9B0185D3865727fEaB5760bF13dde39b00263e5)
- `SoulBoundName`: [`0x8CA9C2564e24E042B8D5F0e53F881Ec61C4856d3`](https://rinkeby.etherscan.io/address/0x8CA9C2564e24E042B8D5F0e53F881Ec61C4856d3)
- `SoulLinker`: [`0x0ffF769274a4fDa68Bf6E99FE0982c4c26B1A4A0`](https://rinkeby.etherscan.io/address/0x0ffF769274a4fDa68Bf6E99FE0982c4c26B1A4A0)

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
