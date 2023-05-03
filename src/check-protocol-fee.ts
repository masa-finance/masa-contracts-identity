/* eslint-disable no-console */
import "@nomiclabs/hardhat-ethers";
import { ethers, deployments, getChainId } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  IUniswapRouter,
  IUniswapRouter__factory,
  SoulStore,
  SoulStore__factory
} from "../typechain";
import { getEnvParams } from "../src/EnvParams";

const env = getEnvParams("hardhat");

// contract instances
let soulStore: SoulStore;

let owner: SignerWithAddress;
let protocolWallet: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;
let authority: SignerWithAddress;

const SOUL_NAME = "soulNameTest";
const YEAR = 1; // 1 year
const ARWEAVE_LINK = "ar://jK9sR4OrYvODj7PD3czIAyNJalub0-vdV_JAg1NqQ-o";

const signMintSoulName = async (
  to: string,
  name: string,
  nameLength: number,
  yearsPeriod: number,
  tokenURI: string,
  authoritySigner: SignerWithAddress
) => {
  const chainId = await getChainId();

  const signature = await authoritySigner._signTypedData(
    // Domain
    {
      name: "SoulStore",
      version: "1.0.0",
      chainId: chainId,
      verifyingContract: soulStore.address
    },
    // Types
    {
      MintSoulName: [
        { name: "to", type: "address" },
        { name: "name", type: "string" },
        { name: "nameLength", type: "uint256" },
        { name: "yearsPeriod", type: "uint256" },
        { name: "tokenURI", type: "string" }
      ]
    },
    // Value
    {
      to: to,
      name: name,
      nameLength: nameLength,
      yearsPeriod: yearsPeriod,
      tokenURI: tokenURI
    }
  );

  return signature;
};

/**
 * main function
 */
async function main() {
  [, owner, protocolWallet, address1, , address2, authority] =
    await ethers.getSigners();

  await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
  await deployments.fixture("SoulName", { fallbackToGlobal: false });
  await deployments.fixture("SoulStore", { fallbackToGlobal: false });

  const { address: soulStoreAddress } = await deployments.get("SoulStore");

  soulStore = SoulStore__factory.connect(soulStoreAddress, owner);
  const uniswapRouter: IUniswapRouter = IUniswapRouter__factory.connect(
    env.SWAP_ROUTER,
    owner
  );

  // we get stable coins for address1
  await uniswapRouter.swapExactETHForTokens(
    0,
    [env.WETH_TOKEN, env.USDC_TOKEN],
    address1.address,
    Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
    {
      value: ethers.utils.parseEther("10")
    }
  );

  // we add authority account
  await soulStore.addAuthority(authority.address);

  await soulStore.connect(address1).purchaseIdentity();

  await soulStore.connect(owner).setProtocolFeeWallet(protocolWallet.address);
  await soulStore.connect(owner).setProtocolFeePercent(10); // 10%
  const { price, protocolFee } = await soulStore.getPriceForMintingName(
    ethers.constants.AddressZero,
    SOUL_NAME.length,
    YEAR
  );

  const signature = await signMintSoulName(
    address1.address,
    SOUL_NAME,
    SOUL_NAME.length,
    YEAR,
    ARWEAVE_LINK,
    authority
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
