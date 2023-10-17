import {
  getPrivateKey,
  getInfuraApiKey,
  getCoinMarketCapApiKey,
  getEtherscanApiKey,
  getBscscanApiKey,
  getPolygonscanApiKey,
  getCeloscanApiKey,
  getBasescanApiKey,
  getOpBnbApiKey,
  getScrollscanApiKey
} from "./src/EnvParams";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-solhint";
import "@nomiclabs/hardhat-etherscan";
import "@primitivefi/hardhat-dodoc";
import "@typechain/ethers-v5";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import { NetworksUserConfig } from "hardhat/types";

const getInfuraURL = (network: string) => {
  return `https://${network}.infura.io/v3/${getInfuraApiKey()}`;
};

const networks: NetworksUserConfig = {
  hardhat: {
    hardfork: "istanbul",
    allowUnlimitedContractSize: true,
    gasPrice: "auto",
    gas: 13000000,
    forking: {
      url: getInfuraURL("goerli")
    }
  },
  alfajores: {
    url: "https://alfajores-forno.celo-testnet.org",
    chainId: 44787,
    accounts: [getPrivateKey("alfajores")]
  },
  celo: {
    url: "https://forno.celo.org",
    chainId: 42220,
    accounts: [getPrivateKey("celo")]
  },
  bsctest: {
    url: "https://data-seed-prebsc-1-s1.binance.org:8545",
    chainId: 97,
    accounts: [getPrivateKey("bsctest")]
  },
  bsc: {
    url: "https://bsc-dataseed.binance.org/",
    chainId: 56,
    accounts: [getPrivateKey("bsc")]
  },
  mumbai: {
    url: "https://rpc-mumbai.maticvigil.com",
    chainId: 80001,
    accounts: [getPrivateKey("mumbai")]
  },
  polygon: {
    url: "https://polygon-rpc.com/",
    chainId: 137,
    accounts: [getPrivateKey("polygon")]
  },
  basegoerli: {
    url: "https://goerli.base.org",
    chainId: 84531,
    accounts: [getPrivateKey("basegoerli")]
  },
  base: {
    url: "https://mainnet.base.org",
    chainId: 8453,
    accounts: [getPrivateKey("base")]
  },
  opbnbtest: {
    url: "https://opbnb-testnet-rpc.bnbchain.org/",
    chainId: 5611,
    accounts: [getPrivateKey("opbnbtest")]
  },
  opbnb: {
    url: "https://opbnb-mainnet-rpc.bnbchain.org",
    chainId: 204,
    accounts: [getPrivateKey("opbnb")]
  },
  scrolltest: {
    url: "https://sepolia-rpc.scroll.io/",
    chainId: 534351,
    accounts: [getPrivateKey("scrolltest")]
  },
  scroll: {
    url: "https://rpc.scroll.io/",
    chainId: 534352,
    accounts: [getPrivateKey("scroll")]
  },
  goerli: {
    url: getInfuraURL("goerli"),
    chainId: 5,
    accounts: [getPrivateKey("goerli")],
    gas: "auto", // 20000000
    gasPrice: 200000000000 //"auto"
  },
  mainnet: {
    url: getInfuraURL("mainnet"),
    chainId: 1,
    accounts: [getPrivateKey("mainnet")],
    gas: "auto", // 20000000
    gasPrice: "auto" // 100000000000
  }
};

export default {
  networks,

  solidity: {
    version: "0.8.8",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
        details: {
          yul: false
        }
      }
    }
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  },
  etherscan: {
    apiKey: {
      bscTestnet: getBscscanApiKey(),
      bsc: getBscscanApiKey(),
      polygonMumbai: getPolygonscanApiKey(),
      polygon: getPolygonscanApiKey(),
      goerli: getEtherscanApiKey(),
      mainnet: getEtherscanApiKey(),
      celo: getCeloscanApiKey(),
      alfajores: getCeloscanApiKey(),
      base: getBasescanApiKey(),
      basegoerli: "PLACEHOLDER_STRING",
      opbnbtest: getOpBnbApiKey(),
      opbnb: getOpBnbApiKey(),
      scrolltest: getScrollscanApiKey(),
      scroll: getScrollscanApiKey()
    },
    customChains: [
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io/"
        }
      },
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io/"
        }
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "basegoerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org"
        }
      },
      {
        network: "opbnbtest",
        chainId: 5611,
        urls: {
          apiURL: "https://opbnb-testnet.nodereal.io/v1/" + getOpBnbApiKey(),
          browserURL: "https://opbnbscan.com/"
        }
      },
      {
        network: "opbnb",
        chainId: 204,
        urls: {
          apiURL: "https://opbnb-mainnet.nodereal.io/v1/" + getOpBnbApiKey(),
          browserURL: "https://mainnet.opbnbscan.com/"
        }
      },
      {
        network: "scrolltest",
        chainId: 534351,
        urls: {
          apiURL: "https://sepolia.scrollscan.com/api" + getScrollscanApiKey(),
          browserURL: "https://sepolia.scrollscan.com/"
        }
      },
      {
        network: "scroll",
        chainId: 534352,
        urls: {
          apiURL: "https://scrollscan.com/api" + getScrollscanApiKey(),
          browserURL: "https://scrollscan.com/"
        }
      }
    ]
  },
  gasReporter: {
    currency: "USD",
    coinmarketcap: getCoinMarketCapApiKey()
  },
  dodoc: {},
  typechain: {
    outDir: "typechain"
  }
};
