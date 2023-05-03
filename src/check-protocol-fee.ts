/* eslint-disable no-console */
import "@nomiclabs/hardhat-ethers";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SoulStore, SoulStore__factory } from "../typechain";
import { getEnvParams } from "../src/EnvParams";

const env = getEnvParams("hardhat");

// contract instances
let soulStore: SoulStore;

let owner: SignerWithAddress;
let protocolWallet: SignerWithAddress;

const YEAR = 1; // 1 year

async function showPrice(length, paymentMethod) {
  const { price, protocolFee } = await soulStore.getPriceForMintingName(
    paymentMethod,
    length,
    YEAR
  );
  const paymentMethodStr =
    paymentMethod === ethers.constants.AddressZero ? "ETH" : "USDC";
  console.log(
    `price      , length ${length}, ${paymentMethodStr}: ${price.toString()}`
  );
  console.log(
    `protocolFee, length ${length}, ${paymentMethodStr}: ${protocolFee.toString()}`
  );
  console.log(
    `TOTAL PRICE, length ${length}, ${paymentMethodStr}: ${price.add(protocolFee).toString()}`
  );
}

/**
 * main function
 */
async function main() {
  [, owner, protocolWallet] = await ethers.getSigners();

  await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
  await deployments.fixture("SoulName", { fallbackToGlobal: false });
  await deployments.fixture("SoulStore", { fallbackToGlobal: false });

  const { address: soulStoreAddress } = await deployments.get("SoulStore");

  soulStore = SoulStore__factory.connect(soulStoreAddress, owner);

  await soulStore.connect(owner).setProtocolFeeWallet(protocolWallet.address);

  console.log(
    "=============================================================================="
  );
  console.log(`protocolFee: 0`);

  await showPrice(1, ethers.constants.AddressZero);
  await showPrice(2, ethers.constants.AddressZero);
  await showPrice(3, ethers.constants.AddressZero);
  await showPrice(4, ethers.constants.AddressZero);
  await showPrice(5, ethers.constants.AddressZero);

  await showPrice(1, env.USDC_TOKEN);
  await showPrice(2, env.USDC_TOKEN);
  await showPrice(3, env.USDC_TOKEN);
  await showPrice(4, env.USDC_TOKEN);
  await showPrice(5, env.USDC_TOKEN);

  console.log(
    "=============================================================================="
  );
  console.log(`protocolFee: 10%`);
  await soulStore.connect(owner).setProtocolFeePercent(10); // 10%

  await showPrice(1, ethers.constants.AddressZero);
  await showPrice(2, ethers.constants.AddressZero);
  await showPrice(3, ethers.constants.AddressZero);
  await showPrice(4, ethers.constants.AddressZero);
  await showPrice(5, ethers.constants.AddressZero);

  await showPrice(1, env.USDC_TOKEN);
  await showPrice(2, env.USDC_TOKEN);
  await showPrice(3, env.USDC_TOKEN);
  await showPrice(4, env.USDC_TOKEN);
  await showPrice(5, env.USDC_TOKEN);

  console.log(
    "=============================================================================="
  );
  console.log(`protocolFee: 1 USDC`);
  await soulStore.connect(owner).setProtocolFeePercent(0); // 0%
  await soulStore.connect(owner).setProtocolFeeAmount(1_000_000); // 1 USDC

  await showPrice(1, ethers.constants.AddressZero);
  await showPrice(2, ethers.constants.AddressZero);
  await showPrice(3, ethers.constants.AddressZero);
  await showPrice(4, ethers.constants.AddressZero);
  await showPrice(5, ethers.constants.AddressZero);

  await showPrice(1, env.USDC_TOKEN);
  await showPrice(2, env.USDC_TOKEN);
  await showPrice(3, env.USDC_TOKEN);
  await showPrice(4, env.USDC_TOKEN);
  await showPrice(5, env.USDC_TOKEN);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
