import "hardhat-deploy";
import "hardhat-docgen";
import "@nomiclabs/hardhat-ethers";
import { NetworksUserConfig } from "hardhat/types";
import fs from "fs-extra";
import fsx from "fs-extra";
import { parse } from "envfile";

export function getSecretParam(param: string, networkName: string | undefined) {
  const path = `.env.${networkName}.secret`;

  fsx.ensureFileSync(path);
  return parse(fs.readFileSync(path))[param];
}

export function getPrivateKey(networkName: string | undefined) {
  const path = `.env.${networkName}.secret`;

  fsx.ensureFileSync(path);
  const privateKey = getSecretParam("DEPLOYER_PRIVATE_KEY", networkName);

  return privateKey
    ? privateKey
    : "0x0000000000000000000000000000000000000000000000000000000000000000";
}

const networks: NetworksUserConfig = {
  hardhat: {
    hardfork: "istanbul",
    allowUnlimitedContractSize: true,
    gasPrice: "auto",
    gas: 13000000,
  },

  alfajores: {
    url: "https://alfajores-forno.celo-testnet.org", // Localhost (default: none)
    accounts: [getPrivateKey("alfajores"), getPrivateKey("alfajores")],
    allowUnlimitedContractSize: true,
    gas: 20000000,
    gasPrice: "auto",
    blockGasLimit: 13000000,
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
      default: 0,
    },
  },
  docgen: {
    path: "./docs/docgen",
    clear: true,
    runOnCompile: true,
  },
};
