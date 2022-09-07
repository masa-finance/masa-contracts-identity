import fs from "fs-extra";
import fsx from "fs-extra";
import { parse } from "envfile";

export function getEnvParams(networkName: string | undefined) {
  if (!networkName) {
    networkName = "hardhat";
  }

  const path = `.env.${networkName}`;

  if (!fs.existsSync(path)) {
    throw new Error(`The env file ${path} doesn't exists.`);
  }

  fsx.ensureFileSync(path);
  return parse(fs.readFileSync(path));
}

export function getSecretParam(param: string, networkName: string | undefined) {
  const path = networkName ? `.env.${networkName}.secret` : `.env.secret`;

  fsx.ensureFileSync(path);
  return parse(fs.readFileSync(path))[param];
}

export function getPrivateKey(networkName: string | undefined) {
  const privateKey = getSecretParam("DEPLOYER_PRIVATE_KEY", networkName);

  return privateKey
    ? privateKey
    : "0x0000000000000000000000000000000000000000000000000000000000000000";
}

export function getInfuraApiKey(networkName: string | undefined) {
  return process.env.INFURA_API_KEY || getSecretParam("INFURA_API_KEY", networkName);
}

export function getEtherscanApiKey(networkName: string | undefined) {
  return getSecretParam("ETHERSCAN_API_KEY", networkName);
}

export function getCoinMarketCapApiKey() {
  return getSecretParam("COINMARKETCAP_API_KEY", undefined);
}
