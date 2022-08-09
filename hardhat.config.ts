import { getPrivateKey } from "./src/utils/EnvParams";
import "hardhat-deploy";
import "@primitivefi/hardhat-dodoc";
import "@nomiclabs/hardhat-ethers";
import { NetworksUserConfig } from "hardhat/types";

const networks: NetworksUserConfig = {
  hardhat: {
    hardfork: "istanbul",
    allowUnlimitedContractSize: true,
    gasPrice: "auto",
    gas: 13000000,
  },

  alfajores: {
    url: "https://alfajores-forno.celo-testnet.org", // Localhost (default: none)
    accounts: [getPrivateKey("alfajores")],
    allowUnlimitedContractSize: true,
    gas: 20000000,
    gasPrice: "auto",
    blockGasLimit: 13000000,
  },
};

export default {
  networks,

  solidity: {
    version: "0.8.7",
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
  },
  dodoc: {},
};
