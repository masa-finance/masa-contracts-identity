# Code snippets

## Ethereum deployment

### Deploy to Rinkby

```

curl -i -X POST \
  https://api-eu1.tatum.io/v3/multitoken/deploy \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: api-key' \
  -H 'x-testnet-type: ethereum-rinkeby' \
  -d '{
    "chain": "ETH",
    "uri": "https://identity.masa.finance.com/{id}",
    "fromPrivateKey": "rinkby-private-key",
    "publicMint": false,
    "fee": {
      "gasLimit": "3000000",
      "gasPrice": "2"
    }
  }'

  ```