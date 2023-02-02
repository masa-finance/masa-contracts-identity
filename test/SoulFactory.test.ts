import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  IERC20,
  IERC20__factory,
  IUniswapRouter,
  IUniswapRouter__factory,
  SoulFactory,
  SoulFactory__factory
} from "../typechain";
import { getEnvParams } from "../src/EnvParams";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

const env = getEnvParams("hardhat");

// contract instances
let soulFactory: SoulFactory;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;
let authority: SignerWithAddress;

const CREATION_PRICE = 10_000_000; // 10 USDC, with 6 decimals
const SBT_NAME = "Soulbound Test";
const SBT_SYMBOL = "SBT";
const SBT_NAME712 = "Soulbound Test";
const SBT_TOKEN_URI = "https://soulbound.io";
const SBT_PAYMENT_PARAMS = {
  swapRouter: ethers.constants.AddressZero,
  wrappedNativeToken: ethers.constants.AddressZero,
  stableCoin: ethers.constants.AddressZero,
  masaToken: ethers.constants.AddressZero,
  reserveWallet: ethers.constants.AddressZero
};

describe("Soul Factory", () => {
  before(async () => {
    [, owner, address1, , address2, authority] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulName", { fallbackToGlobal: false });
    await deployments.fixture("SoulFactory", { fallbackToGlobal: false });

    const { address: soulFactoryAddress } = await deployments.get(
      "SoulFactory"
    );

    soulFactory = SoulFactory__factory.connect(soulFactoryAddress, owner);
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

    // set creation price
    await soulFactory.setCreationPrice(CREATION_PRICE);
  });

  describe("owner functions", () => {
    it("should set SoulboundIdentity from owner", async () => {
      await soulFactory.connect(owner).setSoulboundIdentity(address1.address);

      expect(await soulFactory.soulboundIdentity()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set SoulboundIdentity from non owner", async () => {
      await expect(
        soulFactory.connect(address1).setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });

    it("should set CreationPrice from owner", async () => {
      const newPrice = 100;
      await soulFactory.connect(owner).setCreationPrice(newPrice);

      expect(
        await soulFactory.getCreationPrice(await soulFactory.stableCoin())
      ).to.be.equal(newPrice);
    });

    it("should fail to set CreationPrice from non owner", async () => {
      const newPrice = 100;
      await expect(soulFactory.connect(address1).setCreationPrice(newPrice)).to
        .be.rejected;
    });

    it("should set StableCoin from owner", async () => {
      await soulFactory.connect(owner).setStableCoin(address1.address);

      expect(await soulFactory.stableCoin()).to.be.equal(address1.address);
    });

    it("should fail to set StableCoin from non owner", async () => {
      await expect(
        soulFactory.connect(address1).setStableCoin(address1.address)
      ).to.be.rejected;
    });

    it("should set MasaToken from owner", async () => {
      await soulFactory.connect(owner).setMasaToken(address1.address);

      expect(await soulFactory.masaToken()).to.be.equal(address1.address);
    });

    it("should fail to set MasaToken from non owner", async () => {
      await expect(soulFactory.connect(address1).setMasaToken(address1.address))
        .to.be.rejected;
    });

    it("should set ReserveWallet from owner", async () => {
      await soulFactory.connect(owner).setReserveWallet(address1.address);

      expect(await soulFactory.reserveWallet()).to.be.equal(address1.address);
    });

    it("should fail to set ReserveWallet from non owner", async () => {
      await expect(
        soulFactory.connect(address1).setReserveWallet(address1.address)
      ).to.be.rejected;
    });

    it("should set SwapRouter from owner", async () => {
      await soulFactory.connect(owner).setSwapRouter(address1.address);

      expect(await soulFactory.swapRouter()).to.be.equal(address1.address);
    });

    it("should fail to set SwapRouter from non owner", async () => {
      await expect(
        soulFactory.connect(address1).setSwapRouter(address1.address)
      ).to.be.rejected;
    });

    it("should set WrappedNativeToken from owner", async () => {
      await soulFactory.connect(owner).setWrappedNativeToken(address1.address);

      expect(await soulFactory.wrappedNativeToken()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set WrappedNativeToken from non owner", async () => {
      await expect(
        soulFactory.connect(address1).setWrappedNativeToken(address1.address)
      ).to.be.rejected;
    });
  });

  describe("test pausable", () => {
    it("should pause", async () => {
      await soulFactory.connect(owner).pause();

      expect(await soulFactory.paused()).to.be.true;
    });

    it("should unpause", async () => {
      await soulFactory.connect(owner).pause();
      await soulFactory.connect(owner).unpause();

      expect(await soulFactory.paused()).to.be.false;
    });

    it("should fail to pause from non owner", async () => {
      await expect(soulFactory.connect(address1).pause()).to.be.rejected;
    });

    it("should fail to unpause from non owner", async () => {
      await expect(soulFactory.connect(address1).unpause()).to.be.rejected;
    });
  });

  describe("create new SBT", () => {
    it("we can create a new SBT paying with ETH", async () => {
      const reserveWallet = await soulFactory.reserveWallet();
      const priceInETH = await soulFactory.getCreationPrice(
        ethers.constants.AddressZero
      );
      const reserveWalletBalanceBefore = await ethers.provider.getBalance(
        reserveWallet
      );

      await soulFactory.connect(address1).createNewSBT(
        ethers.constants.AddressZero, // ETH
        address1.address,
        SBT_NAME,
        SBT_SYMBOL,
        SBT_NAME712,
        SBT_TOKEN_URI,
        SBT_PAYMENT_PARAMS,
        { value: priceInETH }
      );

      const reserveWalletBalanceAfter = await ethers.provider.getBalance(
        reserveWallet
      );

      // we check that the reserve wallet received the ETH
      expect(
        reserveWalletBalanceAfter.sub(reserveWalletBalanceBefore)
      ).to.be.equal(priceInETH);
    });

    it("we can create a new SBT paying with stable coin", async () => {
      const reserveWallet = await soulFactory.reserveWallet();
      const priceInStableCoin = await soulFactory.getCreationPrice(
        await soulFactory.stableCoin()
      );

      // set allowance for soul store
      const usdc: IERC20 = IERC20__factory.connect(env.USDC_TOKEN, owner);
      await usdc
        .connect(address1)
        .approve(soulFactory.address, priceInStableCoin);
      const reserveWalletBalanceBefore = await usdc.balanceOf(reserveWallet);

      await soulFactory.connect(address1).createNewSBT(
        env.USDC_TOKEN, // USDC
        address1.address,
        SBT_NAME,
        SBT_SYMBOL,
        SBT_NAME712,
        SBT_TOKEN_URI,
        SBT_PAYMENT_PARAMS
      );

      const reserveWalletBalanceAfter = await usdc.balanceOf(reserveWallet);

      // we check that the reserve wallet received the stable coin
      expect(
        reserveWalletBalanceAfter.sub(reserveWalletBalanceBefore)
      ).to.be.equal(priceInStableCoin);
    });

    it("we can create a new SBT paying with MASA coin", async () => {
      const reserveWallet = await soulFactory.reserveWallet();
      const priceInMasaToken = await soulFactory.getCreationPrice(
        await soulFactory.masaToken()
      );

      // set allowance for soul store
      const masa: IERC20 = IERC20__factory.connect(env.MASA_TOKEN, owner);
      await masa
        .connect(address1)
        .approve(soulFactory.address, priceInMasaToken);
      const reserveWalletBalanceBefore = await masa.balanceOf(reserveWallet);

      await soulFactory.connect(address1).createNewSBT(
        env.MASA_TOKEN, // MASA
        address1.address,
        SBT_NAME,
        SBT_SYMBOL,
        SBT_NAME712,
        SBT_TOKEN_URI,
        SBT_PAYMENT_PARAMS
      );

      const reserveWalletBalanceAfter = await masa.balanceOf(reserveWallet);

      // we check that the reserve wallet received the stable coin
      expect(
        reserveWalletBalanceAfter.sub(reserveWalletBalanceBefore)
      ).to.be.equal(priceInMasaToken);
    });

    it("we can't create a new SBT paying with ETH if we pay less", async () => {
      const priceInETH = await soulFactory.getCreationPrice(
        ethers.constants.AddressZero
      );

      await expect(
        soulFactory.connect(address1).createNewSBT(
          ethers.constants.AddressZero, // ETH
          address1.address,
          SBT_NAME,
          SBT_SYMBOL,
          SBT_NAME712,
          SBT_TOKEN_URI,
          SBT_PAYMENT_PARAMS,
          { value: priceInETH.div(2) }
        )
      ).to.be.rejectedWith("InsufficientEthAmount");
    });

    it("we can't create a new SBT paying with stable coin if we don't have funds", async () => {
      const priceInStableCoin = await soulFactory.getCreationPrice(
        await soulFactory.stableCoin()
      );

      // set allowance for soul store
      const usdc: IERC20 = IERC20__factory.connect(env.USDC_TOKEN, owner);
      await usdc
        .connect(address2)
        .approve(soulFactory.address, priceInStableCoin);

      await expect(
        soulFactory.connect(address2).createNewSBT(
          env.USDC_TOKEN, // USDC
          address2.address,
          SBT_NAME,
          SBT_SYMBOL,
          SBT_NAME712,
          SBT_TOKEN_URI,
          SBT_PAYMENT_PARAMS
        )
      ).to.be.rejected;
    });

    it("we can't create a new SBT paying with MASA coin if we don't have funds", async () => {
      const priceInMasaToken = await soulFactory.getCreationPrice(
        await soulFactory.masaToken()
      );

      // set allowance for soul store
      const masa: IERC20 = IERC20__factory.connect(env.MASA_TOKEN, owner);
      await masa
        .connect(address2)
        .approve(soulFactory.address, priceInMasaToken);

      await expect(
        soulFactory.connect(address2).createNewSBT(
          env.MASA_TOKEN, // MASA
          address2.address,
          SBT_NAME,
          SBT_SYMBOL,
          SBT_NAME712,
          SBT_TOKEN_URI,
          SBT_PAYMENT_PARAMS
        )
      ).to.be.rejected;
    });

    it("we cancreate a new SBT paying with more ETH receiving the refund", async () => {
      const priceInETH = await soulFactory.getCreationPrice(
        ethers.constants.AddressZero
      );

      const balance = await address1.getBalance();

      const tx = await soulFactory.connect(address1).createNewSBT(
        ethers.constants.AddressZero, // ETH
        address1.address,
        SBT_NAME,
        SBT_SYMBOL,
        SBT_NAME712,
        SBT_TOKEN_URI,
        SBT_PAYMENT_PARAMS,
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

  describe("use invalid payment method", () => {
    it("should fail to get creation price for invalid payment method", async () => {
      await expect(
        soulFactory.getCreationPrice(owner.address)
      ).to.be.rejectedWith("InvalidPaymentMethod");
    });

    it("we can't use an invalid payment method", async () => {
      await expect(
        soulFactory.connect(address1).createNewSBT(
          address2.address, // invalid payment method
          address1.address,
          SBT_NAME,
          SBT_SYMBOL,
          SBT_NAME712,
          SBT_TOKEN_URI,
          SBT_PAYMENT_PARAMS
        )
      ).to.be.rejectedWith("InvalidPaymentMethod");
    });
  });
});
