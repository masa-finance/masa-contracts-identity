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
  const { price, protocolFee } =
    await soulStore.getPriceForMintingNameWithProtocolFee(
      paymentMethod,
      length,
      YEAR
    );
  const paymentMethodStr =
    paymentMethod === ethers.constants.AddressZero ? "ETH " : "USDC";
  console.log(
    `price      , length ${length}, ${paymentMethodStr}: ${price
      .toString()
      .padStart(13, " ")}`
  );
  console.log(
    `protocolFee, length ${length}, ${paymentMethodStr}: ${protocolFee
      .toString()
      .padStart(13, " ")}`
  );
  console.log(
    `TOTAL PRICE, length ${length}, ${paymentMethodStr}: ${price
      .add(protocolFee)
      .toString()
      .padStart(13, " ")}`
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

  await soulStore.connect(owner).setProtocolFeeReceiver(protocolWallet.address);

  console.log(
    "=============================================================================="
  );
  console.log(`protocolFee: 0`);

  await showPrice(5, ethers.constants.AddressZero);

  await showPrice(5, env.USDC_TOKEN);

  console.log(
    "=============================================================================="
  );
  console.log(`protocolFee: 10%`);
  await soulStore.connect(owner).setProtocolFeePercent(10); // 10%

  await showPrice(5, ethers.constants.AddressZero);

  await showPrice(5, env.USDC_TOKEN);

  console.log(
    "=============================================================================="
  );
  console.log(`protocolFee: 1 USDC`);
  await soulStore.connect(owner).setProtocolFeePercent(0); // 0%
  await soulStore.connect(owner).setProtocolFeeAmount(1_000_000); // 1 USDC

  await showPrice(5, ethers.constants.AddressZero);

  await showPrice(5, env.USDC_TOKEN);

  console.log(
    "=============================================================================="
  );
  console.log(`SET ALL PRICES TO ZERO`);
  await soulStore.connect(owner).setNameRegistrationPricePerYear(0, 0); // default value
  await soulStore.connect(owner).setNameRegistrationPricePerYear(1, 0); // 1 length
  await soulStore.connect(owner).setNameRegistrationPricePerYear(2, 0); // 2 length
  await soulStore.connect(owner).setNameRegistrationPricePerYear(3, 0); // 3 length
  await soulStore.connect(owner).setNameRegistrationPricePerYear(4, 0); // 4 length
  console.log(
    "=============================================================================="
  );
  console.log(`protocolFee: 0`);
  await soulStore.connect(owner).setProtocolFeeAmount(0);

  await showPrice(5, ethers.constants.AddressZero);

  await showPrice(5, env.USDC_TOKEN);

  console.log(
    "=============================================================================="
  );
  console.log(`protocolFee: 10%`);
  await soulStore.connect(owner).setProtocolFeePercent(10); // 10%

  await showPrice(5, ethers.constants.AddressZero);

  await showPrice(5, env.USDC_TOKEN);

  console.log(
    "=============================================================================="
  );
  console.log(`protocolFee: 1 USDC`);
  await soulStore.connect(owner).setProtocolFeePercent(0); // 0%
  await soulStore.connect(owner).setProtocolFeeAmount(1_000_000); // 1 USDC

  await showPrice(5, ethers.constants.AddressZero);

  await showPrice(5, env.USDC_TOKEN);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
