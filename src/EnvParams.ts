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

export function getBscscanApiKey() {
  return process.env.BSCSCAN_API_KEY || getSecretParam("BSCSCAN_API_KEY");
}

export function getPolygonscanApiKey() {
  return (
    process.env.POLYGONSCAN_API_KEY || getSecretParam("POLYGONSCAN_API_KEY")
  );
}

export function getCeloscanApiKey() {
  return process.env.CELOSCAN_API_KEY || getSecretParam("CELOSCAN_API_KEY");
}

export function getBasescanApiKey() {
  return process.env.BASESCAN_API_KEY || getSecretParam("BASESCAN_API_KEY");
}

export function getOpBnbApiKey() {
  return process.env.OPBNB_API_KEY || getSecretParam("OPBNB_API_KEY");
}

export function getScrollscanApiKey() {
  return process.env.SCROLLSCAN_API_KEY || getSecretParam("SCROLLSCAN_API_KEY");
}

export function getCoinMarketCapApiKey() {
  return (
    process.env.COINMARKETCAP_API_KEY || getSecretParam("COINMARKETCAP_API_KEY")
  );
}
