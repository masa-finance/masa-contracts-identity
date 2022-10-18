/* eslint-disable no-console */
import "@nomiclabs/hardhat-ethers";
import { deployments, ethers } from "hardhat";
import {
  ERC20,
  ERC20__factory,
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
  const [owner] = await ethers.getSigners();
  const chainId = await owner.getChainId();

  const { address: masaAddress } = await deployments.get("MASA");
  const { address: soulboundIdentityAddress } = await deployments.get(
    "SoulboundIdentity"
  );
  const { address: soulboundCreditReportAddress } = await deployments.get(
    "SoulboundCreditReport"
  );
  const { address: soulNameAddress } = await deployments.get("SoulName");
  const { address: soulStoreAddress } = await deployments.get("SoulStore");
  const { address: soulLinkerAddress } = await deployments.get("SoulLinker");

  console.log(
    "=============================================================================="
  );
  console.log(`Account address: ${owner.address}`);
  console.log(`ChainId: ${chainId}`);

  console.log("");

  console.log(`MASA address:                  ${masaAddress}`);
  console.log(`SoulboundIdentity address:     ${soulboundIdentityAddress}`);
  console.log(`SoulboundCreditReport address: ${soulboundCreditReportAddress}`);
  console.log(`SoulName address:              ${soulNameAddress}`);
  console.log(`SoulStore address:             ${soulStoreAddress}`);
  console.log(`SoulLinker address:            ${soulLinkerAddress}`);
  console.log("");

  // create contract instances
  const masa: ERC20 = ERC20__factory.connect(masaAddress, owner);
  const soulboundIdentity: SoulboundIdentity =
    SoulboundIdentity__factory.connect(soulboundIdentityAddress, owner);
  const soulName: SoulName = SoulName__factory.connect(soulNameAddress, owner);
  const soulLinker: SoulLinker = SoulLinker__factory.connect(soulNameAddress, owner);
  const soulStore: SoulStore = SoulStore__factory.connect(soulNameAddress, owner);

  console.log(`MASA balance: ${await masa.balanceOf(owner.address)}`);
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
    `SoulName.SoulboundIdentity: ${await soulName.soulboundIdentity(
    )}`
  );
  console.log(
    `SoulName.extension: ${await soulName.extension(
    )}`
  );
  console.log("");

  console.log(`SoulLinker.SoulboundIdentity: ${await soulLinker.soulboundIdentity()}`);
  console.log(`SoulLinker.linkedSBT: ${await soulLinker.linkedSBTs(0)}`);
  console.log("");

  console.log(`SoulStore.SoulboundIdentity: ${await soulStore.soulboundIdentity()}`);
  console.log(`SoulStore.utilityToken: ${await soulStore.utilityToken()}`);
  console.log(`SoulStore.stableCoin: ${await soulStore.stableCoin()}`);
  console.log(`SoulStore.wrappedNativeToken: ${await soulStore.wrappedNativeToken()}`);
  console.log(`SoulStore.swapRouter: ${await soulStore.swapRouter()}`);
  console.log(`SoulStore.reserveWallet: ${await soulStore.reserveWallet()}`);
  console.log(`SoulStore.getNameRegistrationPricePerYear(1): ${await soulStore.getNameRegistrationPricePerYear('1')}`);
  console.log(`SoulStore.getNameRegistrationPricePerYear(2): ${await soulStore.getNameRegistrationPricePerYear('22')}`);
  console.log(`SoulStore.getNameRegistrationPricePerYear(3): ${await soulStore.getNameRegistrationPricePerYear('333')}`);
  console.log(`SoulStore.getNameRegistrationPricePerYear(4): ${await soulStore.getNameRegistrationPricePerYear('4444')}`);
  console.log(`SoulStore.getNameRegistrationPricePerYear(5): ${await soulStore.getNameRegistrationPricePerYear('55555')}`);

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
