import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  CORN,
  CORN__factory,
  ERC20,
  ERC20__factory,
  IUniswapRouter,
  IUniswapRouter__factory,
  SoulStore,
  SoulStore__factory
} from "../typechain";
import {
  CORN_GOERLI,
  USDC_GOERLI,
  SWAPROUTER_GOERLI,
  WETH_GOERLI
} from "../src/constants";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulStore: SoulStore;

let admin: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

const MINTING_NAME_PRICE_1LETTERS = 50000000000; // 50,000 USDC, with 6 decimals
const MINTING_NAME_PRICE_2LETTERS = 5000000000; // 5,000 USDC, with 6 decimals
const MINTING_NAME_PRICE_3LETTERS = 1500000000; // 1,500 USDC, with 6 decimals
const MINTING_NAME_PRICE_4LETTERS = 500000000; // 500 USDC, with 6 decimals
const MINTING_NAME_PRICE_5LETTERS = 10000000; // 10 USDC, with 6 decimals

const SOUL_NAME = "soulNameTest";
const YEAR = 1; // 1 year
const ARWEAVE_LINK = "ar://jK9sR4OrYvODj7PD3czIAyNJalub0-vdV_JAg1NqQ-o";

describe("Soul Store", () => {
  before(async () => {
    [, admin, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulName", { fallbackToGlobal: false });
    await deployments.fixture("SoulStore", { fallbackToGlobal: false });

    const { address: cornAddress } = await deployments.get("CORN");
    const { address: soulStoreAddress } = await deployments.get("SoulStore");

    soulStore = SoulStore__factory.connect(soulStoreAddress, admin);
    const uniswapRouter: IUniswapRouter = IUniswapRouter__factory.connect(
      SWAPROUTER_GOERLI,
      admin
    );

    // we get $CORN tokens for address1
    const corn: CORN = CORN__factory.connect(cornAddress, admin);
    await corn.connect(address1).mint();

    // we get stable coins for address1
    await uniswapRouter.swapExactETHForTokens(
      0,
      [WETH_GOERLI, USDC_GOERLI],
      address1.address,
      Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
      {
        value: ethers.utils.parseEther("10")
      }
    );

    // we get utility tokens for address1
    await uniswapRouter.swapExactETHForTokens(
      0,
      [WETH_GOERLI, CORN_GOERLI],
      address1.address,
      Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
      {
        value: ethers.utils.parseEther("10")
      }
    );
  });

  describe("pause", () => {
    it("should pause from admin", async () => {
      await soulStore.connect(admin).pause();

      expect(await soulStore.paused()).to.be.true;
    });

    it("should unpause from admin", async () => {
      await soulStore.connect(admin).pause();

      expect(await soulStore.paused()).to.be.true;

      await soulStore.connect(admin).unpause();

      expect(await soulStore.paused()).to.be.false;
    });

    it("should fail to pause from non admin", async () => {
      await expect(soulStore.connect(address1).pause()).to.be.rejected;
    });

    it("should fail to unpause from non admin", async () => {
      await soulStore.connect(admin).pause();

      expect(await soulStore.paused()).to.be.true;

      await expect(soulStore.connect(address1).unpause()).to.be.rejected;
    });
  });

  describe("admin functions", () => {
    it("should set SoulboundIdentity from admin", async () => {
      await soulStore.connect(admin).setSoulboundIdentity(address1.address);

      expect(await soulStore.soulboundIdentity()).to.be.equal(address1.address);
    });

    it("should fail to set SoulboundIdentity from non admin", async () => {
      await expect(
        soulStore.connect(address1).setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });

    it("should set NameRegistrationPricePerYear from admin", async () => {
      const newPrice = 100;
      await soulStore
        .connect(admin)
        .setNameRegistrationPricePerYear(0, newPrice);

      expect(
        await soulStore.getNameRegistrationPricePerYear(SOUL_NAME)
      ).to.be.equal(newPrice);
    });

    it("should fail to set MintingNamePrice from non admin", async () => {
      const newPrice = 100;
      await expect(
        soulStore.connect(address1).setNameRegistrationPricePerYear(0, newPrice)
      ).to.be.rejected;
    });

    it("should set StableCoin from admin", async () => {
      await soulStore.connect(admin).setStableCoin(address1.address);

      expect(await soulStore.stableCoin()).to.be.equal(address1.address);
    });

    it("should fail to set StableCoin from non admin", async () => {
      await expect(soulStore.connect(address1).setStableCoin(address1.address))
        .to.be.rejected;
    });

    it("should set UtilityToken from admin", async () => {
      await soulStore.connect(admin).setUtilityToken(address1.address);

      expect(await soulStore.utilityToken()).to.be.equal(address1.address);
    });

    it("should fail to set UtilityToken from non admin", async () => {
      await expect(
        soulStore.connect(address1).setUtilityToken(address1.address)
      ).to.be.rejected;
    });

    it("should set ReserveWallet from admin", async () => {
      await soulStore.connect(admin).setReserveWallet(address1.address);

      expect(await soulStore.reserveWallet()).to.be.equal(address1.address);
    });

    it("should fail to set ReserveWallet from non admin", async () => {
      await expect(
        soulStore.connect(address1).setReserveWallet(address1.address)
      ).to.be.rejected;
    });

    it("should set SwapRouter from admin", async () => {
      await soulStore.connect(admin).setSwapRouter(address1.address);

      expect(await soulStore.swapRouter()).to.be.equal(address1.address);
    });

    it("should fail to set SwapRouter from non admin", async () => {
      await expect(soulStore.connect(address1).setSwapRouter(address1.address))
        .to.be.rejected;
    });

    it("should set WrappedNativeToken from admin", async () => {
      await soulStore.connect(admin).setWrappedNativeToken(address1.address);

      expect(await soulStore.wrappedNativeToken()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set WrappedNativeToken from non admin", async () => {
      await expect(
        soulStore.connect(address1).setWrappedNativeToken(address1.address)
      ).to.be.rejected;
    });
  });

  describe("purchase info", () => {
    it("we can get name purchase info for 1 and 2 years", async () => {
      const [priceInStableCoin1, priceInETH1, priceInUtilityToken1] =
        await soulStore.purchaseNameInfo(SOUL_NAME, YEAR);

      expect(priceInStableCoin1).to.be.equal(MINTING_NAME_PRICE_5LETTERS);
      expect(priceInETH1).not.to.be.equal("0");
      expect(priceInUtilityToken1).not.to.be.equal("0");

      const [priceInStableCoin2, priceInETH2, priceInUtilityToken2] =
        await soulStore.purchaseNameInfo(SOUL_NAME, YEAR * 2);

      expect(priceInStableCoin2).to.be.equal(MINTING_NAME_PRICE_5LETTERS * 2);
      expect(priceInETH2).not.to.be.equal(priceInETH1.mul(2));
      expect(priceInUtilityToken2).not.to.be.equal(priceInUtilityToken1.mul(2));
    });

    it("we can get 1 letters name purchase info for 1 and 2 years", async () => {
      const SOUL_NAME_1LETTERS = "a";

      const [priceInStableCoin1, priceInETH1, priceInUtilityToken1] =
        await soulStore.purchaseNameInfo(SOUL_NAME_1LETTERS, YEAR);

      expect(priceInStableCoin1).to.be.equal(MINTING_NAME_PRICE_1LETTERS);
      expect(priceInETH1).not.to.be.equal("0");
      expect(priceInUtilityToken1).not.to.be.equal("0");

      const [priceInStableCoin2, priceInETH2, priceInUtilityToken2] =
        await soulStore.purchaseNameInfo(SOUL_NAME_1LETTERS, YEAR * 2);

      expect(priceInStableCoin2).to.be.equal(MINTING_NAME_PRICE_1LETTERS * 2);
      expect(priceInETH2).not.to.be.equal(priceInETH1.mul(2));
      expect(priceInUtilityToken2).not.to.be.equal(priceInUtilityToken1.mul(2));
    });

    it("we can get 2 letters name purchase info for 1 and 2 years", async () => {
      const SOUL_NAME_2LETTERS = "aa";

      const [priceInStableCoin1, priceInETH1, priceInUtilityToken1] =
        await soulStore.purchaseNameInfo(SOUL_NAME_2LETTERS, YEAR);

      expect(priceInStableCoin1).to.be.equal(MINTING_NAME_PRICE_2LETTERS);
      expect(priceInETH1).not.to.be.equal("0");
      expect(priceInUtilityToken1).not.to.be.equal("0");

      const [priceInStableCoin2, priceInETH2, priceInUtilityToken2] =
        await soulStore.purchaseNameInfo(SOUL_NAME_2LETTERS, YEAR * 2);

      expect(priceInStableCoin2).to.be.equal(MINTING_NAME_PRICE_2LETTERS * 2);
      expect(priceInETH2).not.to.be.equal(priceInETH1.mul(2));
      expect(priceInUtilityToken2).not.to.be.equal(priceInUtilityToken1.mul(2));
    });

    it("we can get 3 letters name purchase info for 1 and 2 years", async () => {
      const SOUL_NAME_3LETTERS = "aaa";

      const [priceInStableCoin1, priceInETH1, priceInUtilityToken1] =
        await soulStore.purchaseNameInfo(SOUL_NAME_3LETTERS, YEAR);

      expect(priceInStableCoin1).to.be.equal(MINTING_NAME_PRICE_3LETTERS);
      expect(priceInETH1).not.to.be.equal("0");
      expect(priceInUtilityToken1).not.to.be.equal("0");

      const [priceInStableCoin2, priceInETH2, priceInUtilityToken2] =
        await soulStore.purchaseNameInfo(SOUL_NAME_3LETTERS, YEAR * 2);

      expect(priceInStableCoin2).to.be.equal(MINTING_NAME_PRICE_3LETTERS * 2);
      expect(priceInETH2).not.to.be.equal(priceInETH1.mul(2));
      expect(priceInUtilityToken2).not.to.be.equal(priceInUtilityToken1.mul(2));
    });

    it("we can get 4 letters name purchase info for 1 and 2 years", async () => {
      const SOUL_NAME_4LETTERS = "aaaa";

      const [priceInStableCoin1, priceInETH1, priceInUtilityToken1] =
        await soulStore.purchaseNameInfo(SOUL_NAME_4LETTERS, YEAR);

      expect(priceInStableCoin1).to.be.equal(MINTING_NAME_PRICE_4LETTERS);
      expect(priceInETH1).not.to.be.equal("0");
      expect(priceInUtilityToken1).not.to.be.equal("0");

      const [priceInStableCoin2, priceInETH2, priceInUtilityToken2] =
        await soulStore.purchaseNameInfo(SOUL_NAME_4LETTERS, YEAR * 2);

      expect(priceInStableCoin2).to.be.equal(MINTING_NAME_PRICE_4LETTERS * 2);
      expect(priceInETH2).not.to.be.equal(priceInETH1.mul(2));
      expect(priceInUtilityToken2).not.to.be.equal(priceInUtilityToken1.mul(2));
    });
  });

  describe("purchase identity and name", () => {
    it("we can purchase an identity and name with ETH", async () => {
      const [, priceInETH] = await soulStore.purchaseNameInfo(SOUL_NAME, YEAR);

      await soulStore.connect(address1).purchaseIdentityAndName(
        ethers.constants.AddressZero, // ETH
        SOUL_NAME,
        YEAR,
        ARWEAVE_LINK,
        { value: priceInETH }
      );
    });

    it("we can purchase an identity and name with stable coin", async () => {
      const [priceInStableCoin, ,] = await soulStore.purchaseNameInfo(
        SOUL_NAME,
        YEAR
      );

      // set allowance for soul store
      const usdc: ERC20 = ERC20__factory.connect(USDC_GOERLI, admin);
      await usdc
        .connect(address1)
        .approve(soulStore.address, priceInStableCoin);

      await soulStore.connect(address1).purchaseIdentityAndName(
        USDC_GOERLI, // USDC
        SOUL_NAME,
        YEAR,
        ARWEAVE_LINK
      );
    });

    it("we can purchase an identity and name with utility coin", async () => {
      const [, , priceInUtilityToken] = await soulStore.purchaseNameInfo(
        SOUL_NAME,
        YEAR
      );

      // set allowance for soul store
      const usdc: ERC20 = ERC20__factory.connect(CORN_GOERLI, admin);
      await usdc
        .connect(address1)
        .approve(soulStore.address, priceInUtilityToken);

      await soulStore.connect(address1).purchaseIdentityAndName(
        CORN_GOERLI, // $CORN
        SOUL_NAME,
        YEAR,
        ARWEAVE_LINK
      );
    });

    it("we can't purchase an identity and name with ETH if we pay less", async () => {
      const [, priceInETH] = await soulStore.purchaseNameInfo(SOUL_NAME, YEAR);

      await expect(
        soulStore.connect(address1).purchaseIdentityAndName(
          ethers.constants.AddressZero, // ETH
          SOUL_NAME,
          YEAR,
          ARWEAVE_LINK,
          { value: priceInETH.div(2) }
        )
      ).to.be.rejectedWith("INVALID_PAYMENT_AMOUNT");
    });

    it("we can't purchase an identity and name with stable coin if we don't have funds", async () => {
      const [priceInStableCoin, ,] = await soulStore.purchaseNameInfo(
        SOUL_NAME,
        YEAR
      );

      // set allowance for soul store
      const usdc: ERC20 = ERC20__factory.connect(USDC_GOERLI, admin);
      await usdc
        .connect(address2)
        .approve(soulStore.address, priceInStableCoin);

      await expect(
        soulStore.connect(address2).purchaseIdentityAndName(
          USDC_GOERLI, // USDC
          SOUL_NAME,
          YEAR,
          ARWEAVE_LINK
        )
      ).to.be.rejected;
    });

    it("we can't purchase an identity and name with utility coin if we don't have funds", async () => {
      const [, , priceInUtilityToken] = await soulStore.purchaseNameInfo(
        SOUL_NAME,
        YEAR
      );

      // set allowance for soul store
      const usdc: ERC20 = ERC20__factory.connect(CORN_GOERLI, admin);
      await usdc
        .connect(address2)
        .approve(soulStore.address, priceInUtilityToken);

      await expect(
        soulStore.connect(address2).purchaseIdentityAndName(
          CORN_GOERLI, // $CORN
          SOUL_NAME,
          YEAR,
          ARWEAVE_LINK
        )
      ).to.be.rejected;
    });

    it("we can purchase an identity and name with more ETH receiving the refund", async () => {
      const [, priceInETH] = await soulStore.purchaseNameInfo(SOUL_NAME, YEAR);

      const balance = await address1.getBalance();

      const tx = await soulStore.connect(address1).purchaseIdentityAndName(
        ethers.constants.AddressZero, // ETH
        SOUL_NAME,
        YEAR,
        ARWEAVE_LINK,
        { value: priceInETH.mul(2) }
      );
      const receipt = await tx.wait();

      const balanceAfter = await address1.getBalance();
      const price = await address1.provider?.getGasPrice();
      const gasCost = price?.mul(receipt.gasUsed) || 0;

      // TODO: it fails on coverage, but works on test
      await expect(balanceAfter).to.be.equal(
        balance.sub(priceInETH).sub(gasCost)
      );
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
      const [, priceInETH] = await soulStore.purchaseNameInfo(SOUL_NAME, YEAR);

      await soulStore.connect(address1).purchaseName(
        ethers.constants.AddressZero, // ETH
        SOUL_NAME,
        YEAR,
        ARWEAVE_LINK,
        { value: priceInETH }
      );
    });

    it("we can purchase a name with stable coin", async () => {
      const [priceInStableCoin, ,] = await soulStore.purchaseNameInfo(
        SOUL_NAME,
        YEAR
      );

      // set allowance for soul store
      const usdc: ERC20 = ERC20__factory.connect(USDC_GOERLI, admin);
      await usdc
        .connect(address1)
        .approve(soulStore.address, priceInStableCoin);

      await soulStore.connect(address1).purchaseName(
        USDC_GOERLI, // USDC
        SOUL_NAME,
        YEAR,
        ARWEAVE_LINK
      );
    });

    it("we can purchase a name with utility coin", async () => {
      const [, , priceInUtilityToken] = await soulStore.purchaseNameInfo(
        SOUL_NAME,
        YEAR
      );

      // set allowance for soul store
      const usdc: ERC20 = ERC20__factory.connect(CORN_GOERLI, admin);
      await usdc
        .connect(address1)
        .approve(soulStore.address, priceInUtilityToken);

      await soulStore.connect(address1).purchaseName(
        CORN_GOERLI, // $CORN
        SOUL_NAME,
        YEAR,
        ARWEAVE_LINK
      );
    });

    it("we can't purchase a name with ETH if we pay less", async () => {
      const [, priceInETH] = await soulStore.purchaseNameInfo(SOUL_NAME, YEAR);

      await expect(
        soulStore.connect(address1).purchaseName(
          ethers.constants.AddressZero, // ETH
          SOUL_NAME,
          YEAR,
          ARWEAVE_LINK,
          { value: priceInETH.div(2) }
        )
      ).to.be.rejectedWith("INVALID_PAYMENT_AMOUNT");
    });

    it("we can't purchase a name with stable coin if we don't have funds", async () => {
      const [priceInStableCoin, ,] = await soulStore.purchaseNameInfo(
        SOUL_NAME,
        YEAR
      );

      // set allowance for soul store
      const usdc: ERC20 = ERC20__factory.connect(USDC_GOERLI, admin);
      await usdc
        .connect(address2)
        .approve(soulStore.address, priceInStableCoin);

      await expect(
        soulStore.connect(address2).purchaseName(
          USDC_GOERLI, // USDC
          SOUL_NAME,
          YEAR,
          ARWEAVE_LINK
        )
      ).to.be.rejected;
    });

    it("we can't purchase a name with utility coin if we don't have funds", async () => {
      const [, , priceInUtilityToken] = await soulStore.purchaseNameInfo(
        SOUL_NAME,
        YEAR
      );

      // set allowance for soul store
      const usdc: ERC20 = ERC20__factory.connect(CORN_GOERLI, admin);
      await usdc
        .connect(address2)
        .approve(soulStore.address, priceInUtilityToken);

      await expect(
        soulStore.connect(address2).purchaseName(
          CORN_GOERLI, // $CORN
          SOUL_NAME,
          YEAR,
          ARWEAVE_LINK
        )
      ).to.be.rejected;
    });
  });

  describe("use invalid payment method", () => {
    it("we can't use an invalid payment method", async () => {
      await expect(
        soulStore.connect(address1).purchaseIdentityAndName(
          address2.address, // invalid payment method
          SOUL_NAME,
          YEAR,
          ARWEAVE_LINK
        )
      ).to.be.rejectedWith("INVALID_PAYMENT_METHOD");
    });
  });
});
