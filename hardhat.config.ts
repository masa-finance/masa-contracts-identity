import "hardhat-deploy";
import "hardhat-docgen";
import "@nomiclabs/hardhat-ethers";
import { NetworksUserConfig } from "hardhat/types";

const networks: NetworksUserConfig = {
  hardhat: {
    hardfork: "istanbul",
    allowUnlimitedContractSize: true,
    gasPrice: "auto",
    gas: 13000000,
  },
};

export default {
  networks,

  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    owner: {
      default: 1,
    },
  },
  docgen: {
    path: "./docs/docgen",
    clear: true,
    runOnCompile: true,
  },
};
