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

export function getSecretParam(
  param: string,
  networkName?: string | undefined
) {
  const path = networkName ? `.env.${networkName}.secret` : `.env`;

  fsx.ensureFileSync(path);
  return parse(fs.readFileSync(path))[param];
}

export function getPrivateKey(networkName: string | undefined) {
  const privateKey =
    process.env.DEPLOYER_PRIVATE_KEY ||
    getSecretParam("DEPLOYER_PRIVATE_KEY", networkName);

  return privateKey
    ? privateKey
    : "0x0000000000000000000000000000000000000000000000000000000000000000";
}

export function getInfuraApiKey() {
  return process.env.INFURA_API_KEY || getSecretParam("INFURA_API_KEY");
}

export function getEtherscanApiKey() {
  return process.env.ETHERSCAN_API_KEY || getSecretParam("ETHERSCAN_API_KEY");
}

export function getCoinMarketCapApiKey() {
  return (
    process.env.COINMARKETCAP_API_KEY || getSecretParam("COINMARKETCAP_API_KEY")
  );
}
