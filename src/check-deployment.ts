/* eslint-disable no-console */
import "@nomiclabs/hardhat-ethers";
import { deployments, ethers } from "hardhat";
import { ERC20, ERC20__factory } from "../typechain";

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

  const masa: ERC20 = ERC20__factory.connect(masaAddress, owner);
  console.log(`MASA balance: ${await masa.balanceOf(owner.address)}`);

  console.log("");

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
