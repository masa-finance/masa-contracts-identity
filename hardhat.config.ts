import {
  getPrivateKey,
  getInfuraApiKey,
  getCoinMarketCapApiKey,
  getEtherscanApiKey
} from "./src/utils/EnvParams";
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
  return `https://${network}.infura.io/v3/${getInfuraApiKey(network)}`;
};

const networks: NetworksUserConfig = {
  hardhat: {
    hardfork: "istanbul",
    allowUnlimitedContractSize: true,
    gasPrice: "auto",
    gas: 13000000,
    forking: {
      url: getInfuraURL("mainnet")
    }
  },
  rinkeby: {
    url: getInfuraURL("rinkeby"),
    accounts: [getPrivateKey("rinkeby")],
    gas: 20000000,
    gasPrice: "auto"
  },
  alfajores: {
    url: "https://alfajores-forno.celo-testnet.org", // Localhost (default: none)
    accounts: [getPrivateKey("alfajores")],
    allowUnlimitedContractSize: true,
    gas: 20000000,
    gasPrice: "auto",
    blockGasLimit: 13000000
  }
};

export default {
  networks,

  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
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
      rinkeby: getEtherscanApiKey("rinkeby")
    }
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
