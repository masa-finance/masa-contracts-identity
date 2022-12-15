var request = require('request');
var options = {
   'method': 'POST',
   'url': 'https://graphql.bitquery.io',
   'headers': {
      'Content-Type': 'application/json',
      'X-API-KEY': 'BQY7r0BB1DM4NLa6mpaniA5IIFU6rFMu'
   },
   body: JSON.stringify({
      "query": "query ($network: EthereumNetwork!,$contract: String!,$event: String!, $limit: Int!, $offset: Int!) {\n  ethereum(network: $network) {\n    smartContractEvents(\n      options: {asc: \"block.height\", limit: $limit, offset: $offset}\n      smartContractEvent: {is: $event}\n      smartContractAddress: {is: $contract}\n    ) {\n      block {\n        height\n        timestamp {\n          time\n        }\n      }\n      arguments {\n        value\n        argument\n      }\n    }\n  }\n}\n",
      "variables": "{\n  \"network\": \"goerli\",\n  \"contract\":\"0xB10ddc662BD561f0B26A8B555e15C71430a74fAa\",\n  \"event\":\"Mint\",\n  \"limit\":100,\n  \"offset\":0\n}\n"
   })

};
request(options, function (error, response) {
   if (error) throw new Error(error);
   var json = JSON.parse(response.body);
   console.log(json);
   for (var i = 0; i < json.data.ethereum.smartContractEvents.length; i++) {
      var event = json.data.ethereum.smartContractEvents[i];
      for (var j = 0; j < event.arguments.length; j++) {
          var argument = event.arguments[j];
          if (argument.argument == "_recipient") {
            console.log(argument.value);
          }
      }
   }
});
