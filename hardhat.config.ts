import "dotenv/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-solhint";
import "@nomiclabs/hardhat-etherscan";
import "@nomicfoundation/hardhat-foundry";
import "@primitivefi/hardhat-dodoc";
import "@typechain/ethers-v5";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import { NetworksUserConfig } from "hardhat/types";

const zeroKey =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const networks: NetworksUserConfig = {
  hardhat: {
    hardfork: "istanbul",
    allowUnlimitedContractSize: true,
    gasPrice: "auto",
    gas: 13000000,
    forking: {
      url: process.env.SEPOLIA_RPC_URL ?? "https://rpc2.sepolia.org",
      blockNumber: 5700000
    }
  },
  alfajores: {
    url:
      process.env.ALFAJORES_RPC_URL ??
      "https://alfajores-forno.celo-testnet.org",
    chainId: 44787,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY_TEST ?? zeroKey]
  },
  celo: {
    url: process.env.CELO_RPC_URL ?? "https://forno.celo.org",
    chainId: 42220,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY ?? zeroKey]
  },
  bsctest: {
    url:
      process.env.BSCTEST_RPC_URL ??
      "https://data-seed-prebsc-1-s1.binance.org:8545",
    chainId: 97,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY_TEST ?? zeroKey]
  },
  bsc: {
    url: process.env.BSC_RPC_URL ?? "https://bsc-dataseed.binance.org/",
    chainId: 56,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY ?? zeroKey]
  },
  mumbai: {
    url: process.env.MUMBAI_RPC_URL ?? "https://rpc-mumbai.maticvigil.com",
    chainId: 80001,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY_TEST ?? zeroKey]
  },
  polygon: {
    url: process.env.POLYGON_RPC_URL ?? "https://polygon-rpc.com/",
    chainId: 137,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY ?? zeroKey]
  },
  basegoerli: {
    url: process.env.BASEGOERLI_RPC_URL ?? "https://goerli.base.org",
    chainId: 84531,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY_TEST ?? zeroKey]
  },
  base: {
    url: process.env.BASE_RPC_URL ?? "https://mainnet.base.org",
    chainId: 8453,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY ?? zeroKey]
  },
  opbnbtest: {
    url:
      process.env.OPBNBTEST_RPC_URL ??
      "https://opbnb-testnet-rpc.bnbchain.org/",
    chainId: 5611,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY_TEST ?? zeroKey]
  },
  opbnb: {
    url: process.env.OPBNB_RPC_URL ?? "https://opbnb-mainnet-rpc.bnbchain.org",
    chainId: 204,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY ?? zeroKey]
  },
  scrolltest: {
    url: process.env.SCROLLTEST_RPC_URL ?? "https://sepolia-rpc.scroll.io/",
    chainId: 534351,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY_TEST ?? zeroKey]
  },
  scroll: {
    url: process.env.SCROLL_RPC_URL ?? "https://rpc.scroll.io/",
    chainId: 534352,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY ?? zeroKey]
  },
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL ?? "https://rpc2.sepolia.org",
    chainId: 11155111,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY_TEST ?? zeroKey],
    gas: "auto", // 20000000
    gasPrice: 200000000000 //"auto"
  },
  ethereum: {
    url: process.env.ETHEREUM_RPC_URL ?? "",
    chainId: 1,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY ?? zeroKey],
    gas: "auto", // 20000000
    gasPrice: "auto" // 100000000000
  },
  masa: {
    // tbd
    url:
      process.env.MASA_RPC_URL ??
      "https://subnets.avax.network/masanetwork/mainnet/rpc",
    chainId: 0x3454,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY ?? zeroKey],
    gas: "auto",
    gasPrice: "auto"
  },
  masatest: {
    url:
      process.env.MASATEST_RPC_URL ??
      "https://subnets.avax.network/masatestne/testnet/rpc",
    chainId: 103454,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY_TEST ?? zeroKey],
    gas: "auto",
    gasPrice: "auto"
  }
};

export default {
  networks,

  solidity: {
    version: "0.8.18",
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
      bscTestnet: process.env.BSCSCAN_API_KEY ?? "",
      bsc: process.env.BSCSCAN_API_KEY ?? "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY ?? "",
      polygon: process.env.POLYGONSCAN_API_KEY ?? "",
      sepolia: process.env.ETHERSCAN_API_KEY ?? "",
      ethereum: process.env.ETHERSCAN_API_KEY ?? "",
      celo: process.env.CELOSCAN_API_KEY ?? "",
      alfajores: process.env.CELOSCAN_API_KEY ?? "",
      base: process.env.BASESCAN_API_KEY ?? "",
      basegoerli: process.env.BASESCAN_API_KEY ?? "",
      opbnbtest: process.env.OPBNB_API_KEY ?? "",
      opbnb: process.env.OPBNB_API_KEY ?? "",
      scrolltest: process.env.SCROLLSCAN_API_KEY ?? "",
      scroll: process.env.SCROLLSCAN_API_KEY ?? ""
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
          apiURL:
            "https://opbnb-testnet.nodereal.io/v1/" + process.env.OPBNB_API_KEY,
          browserURL: "https://opbnbscan.com/"
        }
      },
      {
        network: "opbnb",
        chainId: 204,
        urls: {
          apiURL:
            "https://opbnb-mainnet.nodereal.io/v1/" + process.env.OPBNB_API_KEY,
          browserURL: "https://mainnet.opbnbscan.com/"
        }
      },
      {
        network: "scrolltest",
        chainId: 534351,
        urls: {
          apiURL:
            "https://sepolia.scrollscan.com/api" +
            process.env.SCROLLSCAN_API_KEY,
          browserURL: "https://sepolia.scrollscan.com/"
        }
      },
      {
        network: "scroll",
        chainId: 534352,
        urls: {
          apiURL: "https://scrollscan.com/api" + process.env.SCROLLSCAN_API_KEY,
          browserURL: "https://scrollscan.com/"
        }
      }
    ]
  },
  gasReporter: {
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY ?? ""
  },
  dodoc: {},
  typechain: {
    outDir: "typechain",
    target: "ethers-v5"
  }
};
