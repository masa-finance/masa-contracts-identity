# Masa Soul Bound NFTs

## Contract Deployments

### Celo: Alfajores

- `SoulBoundCreditReport`: [`0x0ffF769274a4fDa68Bf6E99FE0982c4c26B1A4A0`](https://alfajores-blockscout.celo-testnet.org/address/0x0ffF769274a4fDa68Bf6E99FE0982c4c26B1A4A0/transactions)
- `SoulBoundIdentity`: [`0x1471A7d3914a38e7488111001e50eCc29D627166`](https://alfajores-blockscout.celo-testnet.org/address/0x1471A7d3914a38e7488111001e50eCc29D627166/transactions)
- `SoulLinker`: [`0x241333a729aE0a49Eb5d595a8866162EE5a5920c`](https://alfajores-blockscout.celo-testnet.org/address/0x241333a729aE0a49Eb5d595a8866162EE5a5920c/transactions)

#### Configuration

- `Owner`: [`0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F`](https://alfajores-blockscout.celo-testnet.org/address/0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F/transactions)

Only the `owner` is allowed to mint SBTs.

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
