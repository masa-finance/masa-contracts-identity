import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments, getChainId } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  IERC20,
  IERC20__factory,
  IUniswapRouter,
  IUniswapRouter__factory,
  SoulStore,
  SoulStore__factory
} from "../typechain";
import { getEnvParams } from "../src/EnvParams";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

const env = getEnvParams("hardhat");

const DAI_GOERLI = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60";

// contract instances
let soulStore: SoulStore;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;
let authority: SignerWithAddress;

const MINTING_NAME_PRICE_1LETTERS = 6_250_000_000; // 6,250 USDC, with 6 decimals
const MINTING_NAME_PRICE_2LETTERS = 1_250_000_000; // 1,250 USDC, with 6 decimals
const MINTING_NAME_PRICE_3LETTERS = 250_000_000; // 250 USDC, with 6 decimals
const MINTING_NAME_PRICE_4LETTERS = 50_000_000; // 50 USDC, with 6 decimals
const MINTING_NAME_PRICE_5LETTERS = 10_000_000; // 10 USDC, with 6 decimals

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

describe("Soul Store", () => {
  before(async () => {
    [, owner, address1, , address2, authority] = await ethers.getSigners();
  });

  beforeEach(async () => {
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

    // we get MASA utility tokens for address1
    await uniswapRouter.swapExactETHForTokens(
      0,
      [env.WETH_TOKEN, env.MASA_TOKEN],
      address1.address,
      Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
      {
        value: ethers.utils.parseEther("10")
      }
    );

    // we get DAI tokens for address1
    await uniswapRouter.swapExactETHForTokens(
      0,
      [env.WETH_TOKEN, DAI_GOERLI],
      address1.address,
      Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
      {
        value: ethers.utils.parseEther("10")
      }
    );

    // we add authority account
    await soulStore.addAuthority(authority.address);
  });

  describe("owner functions", () => {
    it("should set SoulboundIdentity from owner", async () => {
      await soulStore.connect(owner).setSoulboundIdentity(address1.address);

      expect(await soulStore.soulboundIdentity()).to.be.equal(address1.address);
    });

    it("should fail to set SoulboundIdentity from non owner", async () => {
      await expect(
        soulStore.connect(address1).setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });

    it("should set NameRegistrationPricePerYear from owner", async () => {
      const newPrice = 100;
      await soulStore
        .connect(owner)
        .setNameRegistrationPricePerYear(0, newPrice);

      expect(
        await soulStore.getNameRegistrationPricePerYear(SOUL_NAME.length)
      ).to.be.equal(newPrice);
    });

    it("should fail to set MintingNamePrice from non owner", async () => {
      const newPrice = 100;
      await expect(
        soulStore.connect(address1).setNameRegistrationPricePerYear(0, newPrice)
      ).to.be.rejected;
    });

    it("should set StableCoin from owner", async () => {
      await soulStore.connect(owner).setStableCoin(address1.address);

      expect(await soulStore.stableCoin()).to.be.equal(address1.address);
    });

    it("should fail to set StableCoin from non owner", async () => {
      await expect(soulStore.connect(address1).setStableCoin(address1.address))
        .to.be.rejected;
    });

    it("should set MasaToken from owner", async () => {
      await soulStore.connect(owner).setMasaToken(address1.address);

      expect(await soulStore.masaToken()).to.be.equal(address1.address);
    });

    it("should fail to set MasaToken from non owner", async () => {
      await expect(soulStore.connect(address1).setMasaToken(address1.address))
        .to.be.rejected;
    });

    it("should set TreasuryWallet from owner", async () => {
      await soulStore.connect(owner).setTreasuryWallet(address1.address);

      expect(await soulStore.treasuryWallet()).to.be.equal(address1.address);
    });

    it("should fail to set TreasuryWallet from non owner", async () => {
      await expect(
        soulStore.connect(address1).setTreasuryWallet(address1.address)
      ).to.be.rejected;
    });

    it("should set SwapRouter from owner", async () => {
      await soulStore.connect(owner).setSwapRouter(address1.address);

      expect(await soulStore.swapRouter()).to.be.equal(address1.address);
    });

    it("should fail to set SwapRouter from non owner", async () => {
      await expect(soulStore.connect(address1).setSwapRouter(address1.address))
        .to.be.rejected;
    });

    it("should set WrappedNativeToken from owner", async () => {
      await soulStore.connect(owner).setWrappedNativeToken(address1.address);

      expect(await soulStore.wrappedNativeToken()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set WrappedNativeToken from non owner", async () => {
      await expect(
        soulStore.connect(address1).setWrappedNativeToken(address1.address)
      ).to.be.rejected;
    });

    it("should add authority from owner", async () => {
      await soulStore.connect(owner).addAuthority(address1.address);

      expect(await soulStore.authorities(address1.address)).to.be.true;
    });

    it("should fail to add authority from non owner", async () => {
      await expect(soulStore.connect(address1).addAuthority(address1.address))
        .to.be.rejected;
    });

    it("should remove authority from owner", async () => {
      await soulStore.connect(owner).removeAuthority(authority.address);

      expect(await soulStore.authorities(authority.address)).to.be.false;
    });

    it("should fail to remove authority from non owner", async () => {
      await expect(
        soulStore.connect(address1).removeAuthority(authority.address)
      ).to.be.rejected;
    });
  });

  describe("test pausable", () => {
    it("should pause", async () => {
      await soulStore.connect(owner).pause();

      expect(await soulStore.paused()).to.be.true;
    });

    it("should unpause", async () => {
      await soulStore.connect(owner).pause();
      await soulStore.connect(owner).unpause();

      expect(await soulStore.paused()).to.be.false;
    });

    it("should fail to pause from non owner", async () => {
      await expect(soulStore.connect(address1).pause()).to.be.rejected;
    });

    it("should fail to unpause from non owner", async () => {
      await expect(soulStore.connect(address1).unpause()).to.be.rejected;
    });
  });

  describe("purchase info", () => {
    it("we can get name purchase info for 1 and 2 years", async () => {
      const { price: priceInStableCoin1 } =
        await soulStore.getPriceForMintingName(
          await soulStore.stableCoin(),
          SOUL_NAME.length,
          YEAR
        );
      const { price: priceInETH1 } = await soulStore.getPriceForMintingName(
        ethers.constants.AddressZero,
        SOUL_NAME.length,
        YEAR
      );
      const { price: priceInMasaToken1 } =
        await soulStore.getPriceForMintingName(
          await soulStore.masaToken(),
          SOUL_NAME.length,
          YEAR
        );

      expect(priceInStableCoin1).to.be.equal(MINTING_NAME_PRICE_5LETTERS);
      expect(priceInETH1).not.to.be.equal("0");
      expect(priceInMasaToken1).not.to.be.equal("0");

      const { price: priceInStableCoin2 } =
        await soulStore.getPriceForMintingName(
          await soulStore.stableCoin(),
          SOUL_NAME.length,
          YEAR * 2
        );
      const { price: priceInETH2 } = await soulStore.getPriceForMintingName(
        ethers.constants.AddressZero,
        SOUL_NAME.length,
        YEAR * 2
      );
      const { price: priceInMasaToken2 } =
        await soulStore.getPriceForMintingName(
          await soulStore.masaToken(),
          SOUL_NAME.length,
          YEAR * 2
        );

      expect(priceInStableCoin2).to.be.equal(MINTING_NAME_PRICE_5LETTERS * 2);
      expect(priceInETH2).to.be.closeTo(priceInETH1.mul(2), 100);
      expect(priceInMasaToken2).to.be.closeTo(priceInMasaToken1.mul(2), 500);
    });

    it("we can get 1 letters name purchase info for 1 and 2 years", async () => {
      const SOUL_NAME_1LETTERS = "a";

      const { price: priceInStableCoin1 } =
        await soulStore.getPriceForMintingName(
          await soulStore.stableCoin(),
          SOUL_NAME_1LETTERS.length,
          YEAR
        );
      const { price: priceInETH1 } = await soulStore.getPriceForMintingName(
        ethers.constants.AddressZero,
        SOUL_NAME_1LETTERS.length,
        YEAR
      );
      const { price: priceInMasaToken1 } =
        await soulStore.getPriceForMintingName(
          await soulStore.masaToken(),
          SOUL_NAME_1LETTERS.length,
          YEAR
        );

      expect(priceInStableCoin1).to.be.equal(MINTING_NAME_PRICE_1LETTERS);
      expect(priceInETH1).not.to.be.equal("0");
      expect(priceInMasaToken1).not.to.be.equal("0");

      const { price: priceInStableCoin2 } =
        await soulStore.getPriceForMintingName(
          await soulStore.stableCoin(),
          SOUL_NAME_1LETTERS.length,
          YEAR * 2
        );
      const { price: priceInETH2 } = await soulStore.getPriceForMintingName(
        ethers.constants.AddressZero,
        SOUL_NAME_1LETTERS.length,
        YEAR * 2
      );
      const { price: priceInMasaToken2 } =
        await soulStore.getPriceForMintingName(
          await soulStore.masaToken(),
          SOUL_NAME_1LETTERS.length,
          YEAR * 2
        );

      expect(priceInStableCoin2).to.be.equal(MINTING_NAME_PRICE_1LETTERS * 2);
      expect(priceInETH2).not.to.be.equal(priceInETH1.mul(2));
      expect(priceInMasaToken2).not.to.be.equal(priceInMasaToken1.mul(2));
    });

    it("we can get 2 letters name purchase info for 1 and 2 years", async () => {
      const SOUL_NAME_2LETTERS = "aa";

      const { price: priceInStableCoin1 } =
        await soulStore.getPriceForMintingName(
          await soulStore.stableCoin(),
          SOUL_NAME_2LETTERS.length,
          YEAR
        );
      const { price: priceInETH1 } = await soulStore.getPriceForMintingName(
        ethers.constants.AddressZero,
        SOUL_NAME_2LETTERS.length,
        YEAR
      );
      const { price: priceInMasaToken1 } =
        await soulStore.getPriceForMintingName(
          await soulStore.masaToken(),
          SOUL_NAME_2LETTERS.length,
          YEAR
        );

      expect(priceInStableCoin1).to.be.equal(MINTING_NAME_PRICE_2LETTERS);
      expect(priceInETH1).not.to.be.equal("0");
      expect(priceInMasaToken1).not.to.be.equal("0");

      const { price: priceInStableCoin2 } =
        await soulStore.getPriceForMintingName(
          await soulStore.stableCoin(),
          SOUL_NAME_2LETTERS.length,
          YEAR * 2
        );
      const { price: priceInETH2 } = await soulStore.getPriceForMintingName(
        ethers.constants.AddressZero,
        SOUL_NAME_2LETTERS.length,
        YEAR * 2
      );
      const { price: priceInMasaToken2 } =
        await soulStore.getPriceForMintingName(
          await soulStore.masaToken(),
          SOUL_NAME_2LETTERS.length,
          YEAR * 2
        );

      expect(priceInStableCoin2).to.be.equal(MINTING_NAME_PRICE_2LETTERS * 2);
      expect(priceInETH2).not.to.be.equal(priceInETH1.mul(2));
      expect(priceInMasaToken2).not.to.be.equal(priceInMasaToken1.mul(2));
    });

    it("we can get 3 letters name purchase info for 1 and 2 years", async () => {
      const SOUL_NAME_3LETTERS = "aaa";

      const { price: priceInStableCoin1 } =
        await soulStore.getPriceForMintingName(
          await soulStore.stableCoin(),
          SOUL_NAME_3LETTERS.length,
          YEAR
        );
      const { price: priceInETH1 } = await soulStore.getPriceForMintingName(
        ethers.constants.AddressZero,
        SOUL_NAME_3LETTERS.length,
        YEAR
      );
      const { price: priceInMasaToken1 } =
        await soulStore.getPriceForMintingName(
          await soulStore.masaToken(),
          SOUL_NAME_3LETTERS.length,
          YEAR
        );

      expect(priceInStableCoin1).to.be.equal(MINTING_NAME_PRICE_3LETTERS);
      expect(priceInETH1).not.to.be.equal("0");
      expect(priceInMasaToken1).not.to.be.equal("0");

      const { price: priceInStableCoin2 } =
        await soulStore.getPriceForMintingName(
          await soulStore.stableCoin(),
          SOUL_NAME_3LETTERS.length,
          YEAR * 2
        );
      const { price: priceInETH2 } = await soulStore.getPriceForMintingName(
        ethers.constants.AddressZero,
        SOUL_NAME_3LETTERS.length,
        YEAR * 2
      );
      const { price: priceInMasaToken2 } =
        await soulStore.getPriceForMintingName(
          await soulStore.masaToken(),
          SOUL_NAME_3LETTERS.length,
          YEAR * 2
        );

      expect(priceInStableCoin2).to.be.equal(MINTING_NAME_PRICE_3LETTERS * 2);
      expect(priceInETH2).not.to.be.equal(priceInETH1.mul(2));
      expect(priceInMasaToken2).not.to.be.equal(priceInMasaToken1.mul(2));
    });

    it("we can get 4 letters name purchase info for 1 and 2 years", async () => {
      const SOUL_NAME_4LETTERS = "aaaa";

      const { price: priceInStableCoin1 } =
        await soulStore.getPriceForMintingName(
          await soulStore.stableCoin(),
          SOUL_NAME_4LETTERS.length,
          YEAR
        );
      const { price: priceInETH1 } = await soulStore.getPriceForMintingName(
        ethers.constants.AddressZero,
        SOUL_NAME_4LETTERS.length,
        YEAR
      );
      const { price: priceInMasaToken1 } =
        await soulStore.getPriceForMintingName(
          await soulStore.masaToken(),
          SOUL_NAME_4LETTERS.length,
          YEAR
        );

      expect(priceInStableCoin1).to.be.equal(MINTING_NAME_PRICE_4LETTERS);
      expect(priceInETH1).not.to.be.equal("0");
      expect(priceInMasaToken1).not.to.be.equal("0");

      const { price: priceInStableCoin2 } =
        await soulStore.getPriceForMintingName(
          await soulStore.stableCoin(),
          SOUL_NAME_4LETTERS.length,
          YEAR * 2
        );
      const { price: priceInETH2 } = await soulStore.getPriceForMintingName(
        ethers.constants.AddressZero,
        SOUL_NAME_4LETTERS.length,
        YEAR * 2
      );
      const { price: priceInMasaToken2 } =
        await soulStore.getPriceForMintingName(
          await soulStore.masaToken(),
          SOUL_NAME_4LETTERS.length,
          YEAR * 2
        );

      expect(priceInStableCoin2).to.be.equal(MINTING_NAME_PRICE_4LETTERS * 2);
      expect(priceInETH2).not.to.be.equal(priceInETH1.mul(2));
      expect(priceInMasaToken2).not.to.be.equal(priceInMasaToken1.mul(2));
    });
  });

  describe("purchase identity and name", () => {
    it("we can purchase an identity and name with ETH", async () => {
      const treasuryWallet = await soulStore.treasuryWallet();
      const { price } = await soulStore.getPriceForMintingName(
        ethers.constants.AddressZero,
        SOUL_NAME.length,
        YEAR
      );
      const treasuryWalletBalanceBefore = await ethers.provider.getBalance(
        treasuryWallet
      );

      const signature = await signMintSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority
      );

      await soulStore.connect(address1).purchaseIdentityAndName(
        ethers.constants.AddressZero, // ETH
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority.address,
        signature,
        { value: price }
      );

      const treasuryWalletBalanceAfter = await ethers.provider.getBalance(
        treasuryWallet
      );

      // we check that the treasury wallet received the ETH
      expect(
        treasuryWalletBalanceAfter.sub(treasuryWalletBalanceBefore)
      ).to.be.equal(price);
    });

    it("we can purchase an identity and name with stable coin", async () => {
      const treasuryWallet = await soulStore.treasuryWallet();
      const { price } = await soulStore.getPriceForMintingName(
        await soulStore.stableCoin(),
        SOUL_NAME.length,
        YEAR
      );

      // set allowance for soul store
      const usdc: IERC20 = IERC20__factory.connect(env.USDC_TOKEN, owner);
      await usdc.connect(address1).approve(soulStore.address, price);
      const treasuryWalletBalanceBefore = await usdc.balanceOf(treasuryWallet);

      const signature = await signMintSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority
      );

      await soulStore.connect(address1).purchaseIdentityAndName(
        env.USDC_TOKEN, // USDC
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority.address,
        signature
      );

      const treasuryWalletBalanceAfter = await usdc.balanceOf(treasuryWallet);

      // we check that the treasury wallet received the stable coin
      expect(
        treasuryWalletBalanceAfter.sub(treasuryWalletBalanceBefore)
      ).to.be.equal(price);
    });

    it("we can purchase an identity and name with MASA coin", async () => {
      const treasuryWallet = await soulStore.treasuryWallet();
      const { price } = await soulStore.getPriceForMintingName(
        await soulStore.masaToken(),
        SOUL_NAME.length,
        YEAR
      );

      // set allowance for soul store
      const masa: IERC20 = IERC20__factory.connect(env.MASA_TOKEN, owner);
      await masa.connect(address1).approve(soulStore.address, price);
      const treasuryWalletBalanceBefore = await masa.balanceOf(treasuryWallet);

      const signature = await signMintSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority
      );

      await soulStore.connect(address1).purchaseIdentityAndName(
        env.MASA_TOKEN, // MASA
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority.address,
        signature
      );

      const treasuryWalletBalanceAfter = await masa.balanceOf(treasuryWallet);

      // we check that the treasury wallet received the stable coin
      expect(
        treasuryWalletBalanceAfter.sub(treasuryWalletBalanceBefore)
      ).to.be.equal(price);
    });

    it("we can't purchase an identity and name with ETH if we pay less", async () => {
      const { price } = await soulStore.getPriceForMintingName(
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

      await expect(
        soulStore.connect(address1).purchaseIdentityAndName(
          ethers.constants.AddressZero, // ETH
          SOUL_NAME,
          SOUL_NAME.length,
          YEAR,
          ARWEAVE_LINK,
          authority.address,
          signature,
          { value: price.div(2) }
        )
      ).to.be.rejectedWith("InsufficientEthAmount");
    });

    it("we can't purchase an identity and name with stable coin if we don't have funds", async () => {
      const { price } = await soulStore.getPriceForMintingName(
        await soulStore.stableCoin(),
        SOUL_NAME.length,
        YEAR
      );

      // set allowance for soul store
      const usdc: IERC20 = IERC20__factory.connect(env.USDC_TOKEN, owner);
      await usdc.connect(address2).approve(soulStore.address, price);

      const signature = await signMintSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority
      );

      await expect(
        soulStore.connect(address2).purchaseIdentityAndName(
          env.USDC_TOKEN, // USDC
          SOUL_NAME,
          SOUL_NAME.length,
          YEAR,
          ARWEAVE_LINK,
          authority.address,
          signature
        )
      ).to.be.rejected;
    });

    it("we can't purchase an identity and name with MASA coin if we don't have funds", async () => {
      const { price } = await soulStore.getPriceForMintingName(
        await soulStore.masaToken(),
        SOUL_NAME.length,
        YEAR
      );

      // set allowance for soul store
      const masa: IERC20 = IERC20__factory.connect(env.MASA_TOKEN, owner);
      await masa.connect(address2).approve(soulStore.address, price);

      const signature = await signMintSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority
      );

      await expect(
        soulStore.connect(address2).purchaseIdentityAndName(
          env.MASA_TOKEN, // MASA
          SOUL_NAME,
          SOUL_NAME.length,
          YEAR,
          ARWEAVE_LINK,
          authority.address,
          signature
        )
      ).to.be.rejected;
    });

    it("we can purchase an identity and name with more ETH receiving the refund", async () => {
      const { price } = await soulStore.getPriceForMintingName(
        ethers.constants.AddressZero,
        SOUL_NAME.length,
        YEAR
      );

      const balance = await address1.getBalance();

      const signature = await signMintSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority
      );

      const tx = await soulStore.connect(address1).purchaseIdentityAndName(
        ethers.constants.AddressZero, // ETH
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority.address,
        signature,
        { value: price.mul(2) }
      );
      const receipt = await tx.wait();

      const balanceAfter = await address1.getBalance();
      const gasPrice = await address1.provider?.getGasPrice();
      const gasCost = gasPrice?.mul(receipt.gasUsed) || 0;

      // TODO: it fails on coverage, but works on test
      await expect(balanceAfter).to.be.equal(balance.sub(price).sub(gasCost));
    });
  });

  describe("purchase identity", () => {
    it("we can purchase an identity", async () => {
      await soulStore.connect(address1).purchaseIdentity();
    });
  });

  describe("purchase name", () => {
    beforeEach(async () => {
      // first we need to purchase an identity
      await soulStore.connect(address1).purchaseIdentity();
    });

    it("we can purchase a name with ETH", async () => {
      const { price } = await soulStore.getPriceForMintingName(
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

      await soulStore.connect(address1).purchaseName(
        ethers.constants.AddressZero, // ETH
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority.address,
        signature,
        { value: price }
      );
    });

    it("we can purchase a name with stable coin", async () => {
      const { price } = await soulStore.getPriceForMintingName(
        await soulStore.stableCoin(),
        SOUL_NAME.length,
        YEAR
      );

      // set allowance for soul store
      const usdc: IERC20 = IERC20__factory.connect(env.USDC_TOKEN, owner);
      await usdc.connect(address1).approve(soulStore.address, price);

      const signature = await signMintSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority
      );

      await soulStore.connect(address1).purchaseName(
        env.USDC_TOKEN, // USDC
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority.address,
        signature
      );
    });

    it("we can purchase a name with MASA coin", async () => {
      const { price } = await soulStore.getPriceForMintingName(
        await soulStore.masaToken(),
        SOUL_NAME.length,
        YEAR
      );

      // set allowance for soul store
      const masa: IERC20 = IERC20__factory.connect(env.MASA_TOKEN, owner);
      await masa.connect(address1).approve(soulStore.address, price);

      const signature = await signMintSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority
      );

      await soulStore.connect(address1).purchaseName(
        env.MASA_TOKEN, // MASA
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority.address,
        signature
      );
    });

    it("we can't purchase a name with ETH if we pay less", async () => {
      const { price } = await soulStore.getPriceForMintingName(
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

      await expect(
        soulStore.connect(address1).purchaseName(
          ethers.constants.AddressZero, // ETH
          address1.address,
          SOUL_NAME,
          SOUL_NAME.length,
          YEAR,
          ARWEAVE_LINK,
          authority.address,
          signature,
          { value: price.div(2) }
        )
      ).to.be.rejectedWith("InsufficientEthAmount");
    });

    it("we can't purchase a name with stable coin if we don't have funds", async () => {
      const { price } = await soulStore.getPriceForMintingName(
        await soulStore.stableCoin(),
        SOUL_NAME.length,
        YEAR
      );

      // set allowance for soul store
      const usdc: IERC20 = IERC20__factory.connect(env.USDC_TOKEN, owner);
      await usdc.connect(address2).approve(soulStore.address, price);

      const signature = await signMintSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority
      );

      await expect(
        soulStore.connect(address2).purchaseName(
          env.USDC_TOKEN, // USDC
          address1.address,
          SOUL_NAME,
          SOUL_NAME.length,
          YEAR,
          ARWEAVE_LINK,
          authority.address,
          signature
        )
      ).to.be.rejected;
    });

    it("we can't purchase a name with MASA coin if we don't have funds", async () => {
      const { price } = await soulStore.getPriceForMintingName(
        await soulStore.masaToken(),
        SOUL_NAME.length,
        YEAR
      );

      // set allowance for soul store
      const masa: IERC20 = IERC20__factory.connect(env.MASA_TOKEN, owner);
      await masa.connect(address2).approve(soulStore.address, price);

      const signature = await signMintSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority
      );

      await expect(
        soulStore.connect(address2).purchaseName(
          env.MASA_TOKEN, // MASA
          address1.address,
          SOUL_NAME,
          SOUL_NAME.length,
          YEAR,
          ARWEAVE_LINK,
          authority.address,
          signature
        )
      ).to.be.rejected;
    });
  });

  describe("purchase name with other ERC-20 token", () => {
    beforeEach(async () => {
      // first we need to purchase an identity
      await soulStore.connect(address1).purchaseIdentity();
    });

    it("should add ERC-20 token from owner", async () => {
      await soulStore.connect(owner).enablePaymentMethod(DAI_GOERLI);

      expect(await soulStore.enabledPaymentMethod(DAI_GOERLI)).to.be.true;
    });

    it("should get all payment methods information", async () => {
      await soulStore.connect(owner).enablePaymentMethod(DAI_GOERLI);

      const enabledPaymentMethods = await soulStore.getEnabledPaymentMethods();

      expect(enabledPaymentMethods).to.be.deep.equal([
        ethers.constants.AddressZero,
        env.USDC_TOKEN,
        env.MASA_TOKEN,
        DAI_GOERLI
      ]);
    });

    it("should fail to add ERC-20 token from non owner", async () => {
      await expect(soulStore.connect(address1).enablePaymentMethod(DAI_GOERLI))
        .to.be.rejected;
    });

    it("should remove ERC-20 token from owner", async () => {
      await soulStore.connect(owner).enablePaymentMethod(DAI_GOERLI);

      expect(await soulStore.enabledPaymentMethod(DAI_GOERLI)).to.be.true;

      await soulStore.connect(owner).disablePaymentMethod(DAI_GOERLI);

      expect(await soulStore.enabledPaymentMethod(DAI_GOERLI)).to.be.false;
    });

    it("should fail to remove ERC-20 token from non owner", async () => {
      await soulStore.connect(owner).enablePaymentMethod(DAI_GOERLI);

      expect(await soulStore.enabledPaymentMethod(DAI_GOERLI)).to.be.true;

      await expect(soulStore.connect(address1).disablePaymentMethod(DAI_GOERLI))
        .to.be.rejected;
    });

    it("we can purchase a name with other ERC-20 token", async () => {
      await soulStore.connect(owner).enablePaymentMethod(DAI_GOERLI);

      const { price } = await soulStore.getPriceForMintingName(
        DAI_GOERLI,
        SOUL_NAME.length,
        YEAR
      );

      // set allowance for soul store
      const dai: IERC20 = IERC20__factory.connect(DAI_GOERLI, owner);
      await dai.connect(address1).approve(soulStore.address, price);

      const signature = await signMintSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority
      );

      await soulStore.connect(address1).purchaseName(
        DAI_GOERLI, // DAI token, other ERC-20 token
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority.address,
        signature
      );
    });
  });

  describe("use invalid payment method", () => {
    it("should fail to get purchase info for invalid payment method", async () => {
      await expect(
        soulStore.getPriceForMintingName(owner.address, SOUL_NAME.length, YEAR)
      ).to.be.rejectedWith("InvalidPaymentMethod");
    });

    it("we can't use an invalid payment method", async () => {
      const signature = await signMintSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        ARWEAVE_LINK,
        authority
      );

      await expect(
        soulStore.connect(address1).purchaseIdentityAndName(
          address2.address, // invalid payment method
          SOUL_NAME,
          SOUL_NAME.length,
          YEAR,
          ARWEAVE_LINK,
          authority.address,
          signature
        )
      ).to.be.rejectedWith("InvalidPaymentMethod");
    });
  });

  describe("use invalid signature", () => {
    it("we can't use an invalid signature", async () => {
      const { price } = await soulStore.getPriceForMintingName(
        ethers.constants.AddressZero,
        SOUL_NAME.length,
        YEAR
      );

      const signature = await signMintSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length + 1,
        YEAR,
        ARWEAVE_LINK,
        authority
      );

      await expect(
        soulStore
          .connect(address1)
          .purchaseIdentityAndName(
            ethers.constants.AddressZero,
            SOUL_NAME,
            SOUL_NAME.length,
            YEAR,
            ARWEAVE_LINK,
            authority.address,
            signature,
            { value: price }
          )
      ).to.be.rejectedWith("InvalidSignature");
    });

    it("we can't use a non authority signature", async () => {
      const { price } = await soulStore.getPriceForMintingName(
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
        address1
      );

      await expect(
        soulStore
          .connect(address1)
          .purchaseIdentityAndName(
            ethers.constants.AddressZero,
            SOUL_NAME,
            SOUL_NAME.length,
            YEAR,
            ARWEAVE_LINK,
            address1.address,
            signature,
            { value: price }
          )
      ).to.be.rejectedWith("NotAuthorized");
    });
  });
});
