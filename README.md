# Masa NFT Credit Report

## Contract Deployments 

### Ethereum: Rinkby

`0xF51Ff2EEC7fA35462a4eff2eCE7d17d88586569a`

### Celo: Alfrajores

`0x905DD8AF286D0073b9956BeB058a1026cAAdD74E`

## Ethereum deployment

### Deploy contract to Rinkby

```

curl -i -X POST \
  https://api.masa.finance/v1/erc-1155/deploy \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: api-key' \
  -H 'x-testnet-type: ethereum-rinkeby' \
  -d '{
    "chain": "ETH",
    "uri": "https://identity.masa.finance.com/{id}.json",
    "fromPrivateKey": "private-key",
    "publicMint": false,
    "fee": {
      "gasLimit": "3000000",
      "gasPrice": "2"
    }
  }'

  ```

  ### Mint multi token on Rinkby

  ```

  curl -i -X POST \
  https://api.masa.finance/v1/erc-1155/mint \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: api-key' \
  -H 'x-testnet-type: ethereum-rinkeby' \
  -d '{
    "chain": "ETH",
    "tokenId": "9101282661524639659902751014092",
    "amount": "1",
    "to": "eth-address",
    "contractAddress": "0xF51Ff2EEC7fA35462a4eff2eCE7d17d88586569a",
    "data": "0x1234",
    "index": 0,
    "fromPrivateKey": "private-key",
    "fee": {
      "gasLimit": "3000000",
      "gasPrice": "20"
    }
  }'

  ```

  ## Get tokens by address

  ```

  curl -i -X GET \
  https://api.masa.finance/v1/erc-1155/address/balance/ETH/0x2365e84b546e185af46ec48fec9879090952cb57 \
  -H 'x-api-key: api-key' \

  ```

  
  ## Get token metadata

  ```

  curl -i -X GET \
  https://api.masa.finance/v1/erc-1155/metadata/ETH/0xF51Ff2EEC7fA35462a4eff2eCE7d17d88586569a/9101282661524639659902751014092.json \
  -H 'x-api-key: api-key' \
  -H 'x-testnet-type: ethereum-rinkeby'

  ```


## Celo deployment

### Deploy contract to Alfrajores

## Deploy

```

  curl -i -X POST \
  https://api.masa.finance/v1/erc-1155/multitoken/deploy \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: api-key' \
  -d '{
    "chain": "CELO",
    "fromPrivateKey": "private-key",
    "uri": "https://identity.masa.finance.com/{id}.json",
    "publicMint": false,
    "fee": {
      "gasLimit": "400000",
      "gasPrice": "2"
    },
    "feeCurrency": "CELO"
}'

```

## Mint

```

curl -i -X POST \
https://api.masa.finance/v1/erc-1155/mint \
-H 'Content-Type: application/json' \
-H 'x-api-key: api-key' \
-d '{
  "chain": "CELO",
  "tokenId": "87012826615246396599027510140925",
  "amount": "1",
  "to": "0x2365e84b546e185af46ec48fec9879090952cb57",
  "contractAddress": "0x905DD8AF286D0073b9956BeB058a1026cAAdD74E",
  "data": "0x1234",
  "index": 0,
  "fromPrivateKey": "private-key",
  "fee": {
    "gasLimit": "400000",
    "gasPrice": "2"
  },
  "feeCurrency": "CELO"
}'

```
 
## Get tokens by address

```

curl -i -X GET \
  https://api.masa.finance/v1/erc-1155/address/balance/CELO/0x2365e84b546e185af46ec48fec9879090952cb57 \
  -H 'x-api-key: api-key' \

```

## Get token metadata

```

curl -i -X GET \
  https://api.masa.finance/v1/erc-1155/metadata/CELO/0x905DD8AF286D0073b9956BeB058a1026cAAdD74E/91012826615246396599027510140925 \
  -H 'x-api-key: api-key' \

```