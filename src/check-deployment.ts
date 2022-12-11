/* eslint-disable no-console */
import "@nomiclabs/hardhat-ethers";
import { deployments, ethers } from "hardhat";
import {
  IERC20,
  IERC20__factory,
  SoulboundIdentity,
  SoulboundIdentity__factory,
  SoulLinker__factory,
  SoulName,
  SoulName__factory,
  SoulStore,
  SoulStore__factory
} from "../typechain";
import { SoulLinker } from "../typechain/contracts/SoulLinker";

/**
 * main function
 */
async function main() {
  const [admin] = await ethers.getSigners();
  const chainId = await admin.getChainId();

  const { address: masaAddress } = await deployments.get("MASA");
  const { address: soulboundIdentityAddress } = await deployments.get(
    "SoulboundIdentity"
  );
  const { address: soulboundCreditScoreAddress } = await deployments.get(
    "SoulboundCreditScore"
  );
  const { address: soulbound2FAAddress } = await deployments.get(
    "Soulbound2FA"
  );
  const { address: soulNameAddress } = await deployments.get("SoulName");
  const { address: soulStoreAddress } = await deployments.get("SoulStore");
  const { address: soulLinkerAddress } = await deployments.get("SoulLinker");

  console.log(
    "=============================================================================="
  );
  console.log(`Account address: ${admin.address}`);
  console.log(`ChainId: ${chainId}`);

  console.log("");

  console.log(`MASA address:                  ${masaAddress}`);
  console.log(`SoulboundIdentity address:     ${soulboundIdentityAddress}`);
  console.log(`SoulboundCreditScore address:  ${soulboundCreditScoreAddress}`);
  console.log(`Soulbound2FA address:          ${soulbound2FAAddress}`);
  console.log(`SoulName address:              ${soulNameAddress}`);
  console.log(`SoulStore address:             ${soulStoreAddress}`);
  console.log(`SoulLinker address:            ${soulLinkerAddress}`);
  console.log("");

  // create contract instances
  const masa: IERC20 = IERC20__factory.connect(masaAddress, admin);
  const soulboundIdentity: SoulboundIdentity =
    SoulboundIdentity__factory.connect(soulboundIdentityAddress, admin);
  const soulName: SoulName = SoulName__factory.connect(soulNameAddress, admin);
  const soulLinker: SoulLinker = SoulLinker__factory.connect(
    soulLinkerAddress,
    admin
  );
  const soulStore: SoulStore = SoulStore__factory.connect(
    soulStoreAddress,
    admin
  );

  console.log(`MASA balance: ${await masa.balanceOf(admin.address)}`);
  console.log("");

  const IDENTITY_MINTER_ROLE = await soulboundIdentity.MINTER_ROLE();
  console.log(
    `SoulboundIdentity.hasRole(MINTER_ROLE, SoulStore): ${await soulboundIdentity.hasRole(
      IDENTITY_MINTER_ROLE,
      soulStoreAddress
    )}`
  );
  console.log(
    `SoulboundIdentity.SoulName: ${await soulboundIdentity.getSoulName()}`
  );
  console.log("");

  const NAME_MINTER_ROLE = await soulName.MINTER_ROLE();
  console.log(
    `SoulName.hasRole(MINTER_ROLE, SoulboundIdentity): ${await soulName.hasRole(
      NAME_MINTER_ROLE,
      soulboundIdentityAddress
    )}`
  );
  console.log(
    `SoulName.hasRole(MINTER_ROLE, SoulStore): ${await soulName.hasRole(
      NAME_MINTER_ROLE,
      soulStoreAddress
    )}`
  );
  console.log(
    `SoulName.SoulboundIdentity: ${await soulName.soulboundIdentity()}`
  );
  console.log(`SoulName.extension: ${await soulName.extension()}`);
  console.log("");

  console.log(
    `SoulLinker.SoulboundIdentity: ${await soulLinker.soulboundIdentity()}`
  );
  console.log(
    `SoulLinker.linkedSBT(SoulboundCreditScore): ${await soulLinker.linkedSBT(
      soulboundCreditScoreAddress
    )}`
  );
  console.log(
    `SoulLinker.linkedSBT(Soulbound2FA): ${await soulLinker.linkedSBT(
      soulbound2FAAddress
    )}`
  );
  console.log("");

  console.log(
    `SoulStore.SoulboundIdentity: ${await soulStore.soulboundIdentity()}`
  );
  console.log(`SoulStore.masaToken: ${await soulStore.masaToken()}`);
  console.log(`SoulStore.stableCoin: ${await soulStore.stableCoin()}`);
  console.log(
    `SoulStore.wrappedNativeToken: ${await soulStore.wrappedNativeToken()}`
  );
  console.log(`SoulStore.swapRouter: ${await soulStore.swapRouter()}`);
  console.log(`SoulStore.reserveWallet: ${await soulStore.reserveWallet()}`);
  console.log(
    `SoulStore.getNameRegistrationPricePerYear(1): ${await soulStore.getNameRegistrationPricePerYear(
      "1"
    )}`
  );
  console.log(
    `SoulStore.getNameRegistrationPricePerYear(2): ${await soulStore.getNameRegistrationPricePerYear(
      "22"
    )}`
  );
  console.log(
    `SoulStore.getNameRegistrationPricePerYear(3): ${await soulStore.getNameRegistrationPricePerYear(
      "333"
    )}`
  );
  console.log(
    `SoulStore.getNameRegistrationPricePerYear(4): ${await soulStore.getNameRegistrationPricePerYear(
      "4444"
    )}`
  );
  console.log(
    `SoulStore.getNameRegistrationPricePerYear(5): ${await soulStore.getNameRegistrationPricePerYear(
      "55555"
    )}`
  );

  console.log(
    "=============================================================================="
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
