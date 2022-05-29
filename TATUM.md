# Code snippets

## Ethereum deployment

### Deploy to Ropsten

```
{
  "chain": "ETH",
  "uri": "https://identity.masa.finance.com/{id}",
  "fromPrivateKey": "private-key-here",
  "publicMint": false,
  "nonce": 0,
  "fee": {
    "gasLimit": "40000",
    "gasPrice": "20"
  }
}
```


```

curl --location --request POST 'https://api-eu1.tatum.io/v3/multitoken/deploy/' \
--header 'Content-Type: application/json' \
--header 'x-api-key: api-key' \
--data-raw '{
     "chain": "ETH",
     "uri": "https://identity.masa.finance.com/{id}",
    "fromPrivateKey": "private-key-here",
    "publicMint": false,
    "nonce": 0,
    "fee": {
        "gasLimit": "40000",
        "gasPrice": "20"
    }
}'