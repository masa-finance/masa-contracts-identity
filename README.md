# Masa Soul Bound NFTs

## Contract Deployments

### Celo: Alfajores

- `SoulBoundCreditReport`: [`0x6F5a1CEfB1021cb188EBAe4c0118bfD5c71edBD7`](https://alfajores-blockscout.celo-testnet.org/address/0x6F5a1CEfB1021cb188EBAe4c0118bfD5c71edBD7/transactions)
- `SoulBoundIdentity`: [`0x1be6c425d17380D0BCF62099a27BE4e9c5cF8719`](https://alfajores-blockscout.celo-testnet.org/address/0x1be6c425d17380D0BCF62099a27BE4e9c5cF8719/transactions)
- `SoulLinker`: [`0xa703e73025f8169cbf299ED727a80eD845315dF2`](https://alfajores-blockscout.celo-testnet.org/address/0xa703e73025f8169cbf299ED727a80eD845315dF2/transactions)

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

Set `DEPLOYER_PRIVATE_KEY` to the deployers private key in `.env.{network}.secret`

### Deploy

Run: `yarn deploy --network {network}` to deploy.
