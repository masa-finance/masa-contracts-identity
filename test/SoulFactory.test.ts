import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  ERC20,
  ERC20__factory,
  IUniswapRouter,
  IUniswapRouter__factory,
  SoulFactory,
  SoulFactory__factory
} from "../typechain";
import {
  CORN_RINKEBY,
  USDC_RINKEBY,
  SWAPROUTER_RINKEBY,
  WETH_RINKEBY
} from "../src/constants";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulFactory: SoulFactory;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

const MINTING_IDENTITY_AND_NAME_PRICE = "5000000"; // 5 USDC, with 6 decimals
const MINTING_IDENTITY_PRICE = "3000000"; // 3 USDC, with 6 decimals
const MINTING_NAME_PRICE = "3000000"; // 3 USDC, with 6 decimals

const SOUL_NAME = "soulNameTest";

describe("Soul Factory", () => {
  before(async () => {
    [, owner, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulName", { fallbackToGlobal: false });
    await deployments.fixture("SoulFactory", { fallbackToGlobal: false });

    const { address: soulboundIdentityAddress } = await deployments.get(
      "SoulboundIdentity"
    );
    const { address: soulNameAddress } = await deployments.get("SoulName");
    const { address: soulFactoryAddress } = await deployments.get(
      "SoulFactory"
    );

    soulFactory = SoulFactory__factory.connect(soulFactoryAddress, owner);
    const uniswapRouter: IUniswapRouter = IUniswapRouter__factory.connect(
      SWAPROUTER_RINKEBY,
      owner
    );

    // we get stable coins for address1
    await uniswapRouter.swapExactETHForTokens(
      0,
      [WETH_RINKEBY, USDC_RINKEBY],
      address1.address,
      Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
      {
        value: ethers.utils.parseEther("10")
      }
    );

    // we get utility tokens for address1
    await uniswapRouter.swapExactETHForTokens(
      0,
      [WETH_RINKEBY, CORN_RINKEBY],
      address1.address,
      Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
      {
        value: ethers.utils.parseEther("10")
      }
    );
  });

  describe("pause", () => {
    it("should pause from owner", async () => {
      await soulFactory.connect(owner).pause();

      expect(await soulFactory.paused()).to.be.true;
    });

    it("should unpause from owner", async () => {
      await soulFactory.connect(owner).pause();

      expect(await soulFactory.paused()).to.be.true;

      await soulFactory.connect(owner).unpause();

      expect(await soulFactory.paused()).to.be.false;
    });

    it("should fail to pause from non owner", async () => {
      await expect(soulFactory.connect(address1).pause()).to.be.rejected;
    });

    it("should fail to unpause from non owner", async () => {
      await soulFactory.connect(owner).pause();

      expect(await soulFactory.paused()).to.be.true;

      await expect(soulFactory.connect(address1).unpause()).to.be.rejected;
    });
  });

  describe("admin functions", () => {
    it("should set SoulboundIdentity from admin", async () => {
      await soulFactory.connect(owner).setSoulboundIdentity(address1.address);

      expect(await soulFactory.soulboundIdentity()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set SoulboundIdentity from non admin", async () => {
      await expect(
        soulFactory.connect(address1).setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });

    it("should set MintingIdentityAndNamePrice from admin", async () => {
      const newPrice = 100;
      await soulFactory.connect(owner).setMintingIdentityAndNamePrice(newPrice);

      expect(await soulFactory.mintingIdentityAndNamePrice()).to.be.equal(
        newPrice
      );
    });

    it("should fail to set MintingIdentityAndNamePrice from non admin", async () => {
      const newPrice = 100;
      await expect(
        soulFactory.connect(address1).setMintingIdentityAndNamePrice(newPrice)
      ).to.be.rejected;
    });

    it("should set MintingIdentityPrice from admin", async () => {
      const newPrice = 100;
      await soulFactory.connect(owner).setMintingIdentityPrice(newPrice);

      expect(await soulFactory.mintingIdentityPrice()).to.be.equal(newPrice);
    });

    it("should fail to set MintingIdentityPrice from non admin", async () => {
      const newPrice = 100;
      await expect(
        soulFactory.connect(address1).setMintingIdentityPrice(newPrice)
      ).to.be.rejected;
    });

    it("should set MintingNamePrice from admin", async () => {
      const newPrice = 100;
      await soulFactory.connect(owner).setMintingNamePrice(newPrice);

      expect(await soulFactory.mintingNamePrice()).to.be.equal(newPrice);
    });

    it("should fail to set MintingNamePrice from non admin", async () => {
      const newPrice = 100;
      await expect(soulFactory.connect(address1).setMintingNamePrice(newPrice))
        .to.be.rejected;
    });

    it("should set StableCoin from admin", async () => {
      await soulFactory.connect(owner).setStableCoin(address1.address);

      expect(await soulFactory.stableCoin()).to.be.equal(address1.address);
    });

    it("should fail to set StableCoin from non admin", async () => {
      await expect(
        soulFactory.connect(address1).setStableCoin(address1.address)
      ).to.be.rejected;
    });

    it("should set UtilityToken from admin", async () => {
      await soulFactory.connect(owner).setUtilityToken(address1.address);

      expect(await soulFactory.utilityToken()).to.be.equal(address1.address);
    });

    it("should fail to set UtilityToken from non admin", async () => {
      await expect(
        soulFactory.connect(address1).setUtilityToken(address1.address)
      ).to.be.rejected;
    });

    it("should set ReserveWallet from admin", async () => {
      await soulFactory.connect(owner).setReserveWallet(address1.address);

      expect(await soulFactory.reserveWallet()).to.be.equal(address1.address);
    });

    it("should fail to set ReserveWallet from non admin", async () => {
      await expect(
        soulFactory.connect(address1).setReserveWallet(address1.address)
      ).to.be.rejected;
    });

    it("should set SwapRouter from admin", async () => {
      await soulFactory.connect(owner).setSwapRouter(address1.address);

      expect(await soulFactory.swapRouter()).to.be.equal(address1.address);
    });

    it("should fail to set SwapRouter from non admin", async () => {
      await expect(
        soulFactory.connect(address1).setSwapRouter(address1.address)
      ).to.be.rejected;
    });

    it("should set WrappedNativeToken from admin", async () => {
      await soulFactory.connect(owner).setWrappedNativeToken(address1.address);

      expect(await soulFactory.wrappedNativeToken()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set WrappedNativeToken from non admin", async () => {
      await expect(
        soulFactory.connect(address1).setWrappedNativeToken(address1.address)
      ).to.be.rejected;
    });
  });

  describe("purchase info", () => {
    it("we can get identity and name purchase info", async () => {
      const [priceInStableCoin, priceInETH, priceInUtilityToken] =
        await soulFactory.purchaseIdentityAndNameInfo();

      expect(priceInStableCoin).to.be.equal(MINTING_IDENTITY_AND_NAME_PRICE);
      expect(priceInETH.toNumber()).to.be.greaterThan(0);
      expect(priceInUtilityToken.toNumber()).to.be.greaterThan(0);
    });

    it("we can get identity purchase info", async () => {
      const [priceInStableCoin, priceInETH, priceInUtilityToken] =
        await soulFactory.purchaseIdentityInfo();

      expect(priceInStableCoin).to.be.equal(MINTING_IDENTITY_PRICE);
      expect(priceInETH.toNumber()).to.be.greaterThan(0);
      expect(priceInUtilityToken.toNumber()).to.be.greaterThan(0);
    });

    it("we can get name purchase info", async () => {
      const [priceInStableCoin, priceInETH, priceInUtilityToken] =
        await soulFactory.purchaseNameInfo();

      expect(priceInStableCoin).to.be.equal(MINTING_NAME_PRICE);
      expect(priceInETH.toNumber()).to.be.greaterThan(0);
      expect(priceInUtilityToken.toNumber()).to.be.greaterThan(0);
    });
  });

  describe("purchase identity and name", () => {
    it("we can purchase an identity and name with ETH", async () => {
      const [, priceInETH] = await soulFactory.purchaseIdentityAndNameInfo();

      await soulFactory.connect(address1).purchaseIdentityAndName(
        ethers.constants.AddressZero, // ETH
        SOUL_NAME,
        { value: priceInETH }
      );
    });

    it("we can purchase an identity and name with stable coin", async () => {
      const [priceInStableCoin, ,] =
        await soulFactory.purchaseIdentityAndNameInfo();

      // set allowance for soul factory
      const usdc: ERC20 = ERC20__factory.connect(USDC_RINKEBY, owner);
      await usdc
        .connect(address1)
        .approve(soulFactory.address, priceInStableCoin);

      await soulFactory.connect(address1).purchaseIdentityAndName(
        USDC_RINKEBY, // USDC
        SOUL_NAME
      );
    });

    it("we can purchase an identity and name with utility coin", async () => {
      const [, , priceInUtilityToken] =
        await soulFactory.purchaseIdentityAndNameInfo();

      // set allowance for soul factory
      const usdc: ERC20 = ERC20__factory.connect(CORN_RINKEBY, owner);
      await usdc
        .connect(address1)
        .approve(soulFactory.address, priceInUtilityToken);

      await soulFactory.connect(address1).purchaseIdentityAndName(
        CORN_RINKEBY, // $CORN
        SOUL_NAME
      );
    });

    it("we can't purchase an identity and name with ETH if we pay less", async () => {
      const [, priceInETH] = await soulFactory.purchaseIdentityAndNameInfo();

      await expect(
        soulFactory.connect(address1).purchaseIdentityAndName(
          ethers.constants.AddressZero, // ETH
          SOUL_NAME,
          { value: priceInETH.div(2) }
        )
      ).to.be.rejectedWith("INVALID_PAYMENT_AMOUNT");
    });

    it("we can't purchase an identity and name with stable coin if we don't have funds", async () => {
      const [priceInStableCoin, ,] =
        await soulFactory.purchaseIdentityAndNameInfo();

      // set allowance for soul factory
      const usdc: ERC20 = ERC20__factory.connect(USDC_RINKEBY, owner);
      await usdc
        .connect(address2)
        .approve(soulFactory.address, priceInStableCoin);

      await expect(
        soulFactory.connect(address2).purchaseIdentityAndName(
          USDC_RINKEBY, // USDC
          SOUL_NAME
        )
      ).to.be.rejected;
    });

    it("we can't purchase an identity and name with utility coin if we don't have funds", async () => {
      const [, , priceInUtilityToken] =
        await soulFactory.purchaseIdentityAndNameInfo();

      // set allowance for soul factory
      const usdc: ERC20 = ERC20__factory.connect(CORN_RINKEBY, owner);
      await usdc
        .connect(address2)
        .approve(soulFactory.address, priceInUtilityToken);

      await expect(
        soulFactory.connect(address2).purchaseIdentityAndName(
          CORN_RINKEBY, // $CORN
          SOUL_NAME
        )
      ).to.be.rejected;
    });

    it("we can purchase an identity and name with more ETH receiving the refund", async () => {
      const [, priceInETH] = await soulFactory.purchaseIdentityAndNameInfo();

      const balance = await address1.getBalance();

      const tx = await soulFactory.connect(address1).purchaseIdentityAndName(
        ethers.constants.AddressZero, // ETH
        SOUL_NAME,
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
    it("we can purchase an identity with ETH", async () => {
      const [, priceInETH] = await soulFactory.purchaseIdentityInfo();

      await soulFactory.connect(address1).purchaseIdentity(
        ethers.constants.AddressZero, // ETH
        { value: priceInETH }
      );
    });

    it("we can purchase an identity with stable coin", async () => {
      const [priceInStableCoin, ,] = await soulFactory.purchaseIdentityInfo();

      // set allowance for soul factory
      const usdc: ERC20 = ERC20__factory.connect(USDC_RINKEBY, owner);
      await usdc
        .connect(address1)
        .approve(soulFactory.address, priceInStableCoin);

      await soulFactory.connect(address1).purchaseIdentity(
        USDC_RINKEBY // USDC
      );
    });

    it("we can purchase an identity with utility coin", async () => {
      const [, , priceInUtilityToken] =
        await soulFactory.purchaseIdentityInfo();

      // set allowance for soul factory
      const usdc: ERC20 = ERC20__factory.connect(CORN_RINKEBY, owner);
      await usdc
        .connect(address1)
        .approve(soulFactory.address, priceInUtilityToken);

      await soulFactory.connect(address1).purchaseIdentity(
        CORN_RINKEBY // $CORN
      );
    });

    it("we can't purchase an identity with ETH if we pay less", async () => {
      const [, priceInETH] = await soulFactory.purchaseIdentityInfo();

      await expect(
        soulFactory.connect(address1).purchaseIdentity(
          ethers.constants.AddressZero, // ETH
          { value: priceInETH.div(2) }
        )
      ).to.be.rejectedWith("INVALID_PAYMENT_AMOUNT");
    });

    it("we can't purchase an identity with stable coin if we don't have funds", async () => {
      const [priceInStableCoin, ,] = await soulFactory.purchaseIdentityInfo();

      // set allowance for soul factory
      const usdc: ERC20 = ERC20__factory.connect(USDC_RINKEBY, owner);
      await usdc
        .connect(address2)
        .approve(soulFactory.address, priceInStableCoin);

      await expect(
        soulFactory.connect(address2).purchaseIdentity(
          USDC_RINKEBY // USDC
        )
      ).to.be.rejected;
    });

    it("we can't purchase an identity with utility coin if we don't have funds", async () => {
      const [, , priceInUtilityToken] =
        await soulFactory.purchaseIdentityInfo();

      // set allowance for soul factory
      const usdc: ERC20 = ERC20__factory.connect(CORN_RINKEBY, owner);
      await usdc
        .connect(address2)
        .approve(soulFactory.address, priceInUtilityToken);

      await expect(
        soulFactory.connect(address2).purchaseIdentity(
          CORN_RINKEBY // $CORN
        )
      ).to.be.rejected;
    });
  });

  describe("purchase name", () => {
    beforeEach(async () => {
      const [, priceInETH] = await soulFactory.purchaseIdentityInfo();

      // first we need to purchase an identity
      await soulFactory.connect(address1).purchaseIdentity(
        ethers.constants.AddressZero, // ETH
        { value: priceInETH }
      );
    });

    it("we can purchase a name with ETH", async () => {
      const [, priceInETH] = await soulFactory.purchaseNameInfo();

      await soulFactory.connect(address1).purchaseName(
        ethers.constants.AddressZero, // ETH
        SOUL_NAME,
        { value: priceInETH }
      );
    });

    it("we can purchase a name with stable coin", async () => {
      const [priceInStableCoin, ,] = await soulFactory.purchaseNameInfo();

      // set allowance for soul factory
      const usdc: ERC20 = ERC20__factory.connect(USDC_RINKEBY, owner);
      await usdc
        .connect(address1)
        .approve(soulFactory.address, priceInStableCoin);

      await soulFactory.connect(address1).purchaseName(
        USDC_RINKEBY, // USDC
        SOUL_NAME
      );
    });

    it("we can purchase a name with utility coin", async () => {
      const [, , priceInUtilityToken] =
        await soulFactory.purchaseNameInfo();

      // set allowance for soul factory
      const usdc: ERC20 = ERC20__factory.connect(CORN_RINKEBY, owner);
      await usdc
        .connect(address1)
        .approve(soulFactory.address, priceInUtilityToken);

      await soulFactory.connect(address1).purchaseName(
        CORN_RINKEBY, // $CORN
        SOUL_NAME
      );
    });

    it("we can't purchase a name with ETH if we pay less", async () => {
      const [, priceInETH] = await soulFactory.purchaseNameInfo();

      await expect(
        soulFactory.connect(address1).purchaseName(
          ethers.constants.AddressZero, // ETH
          SOUL_NAME,
          { value: priceInETH.div(2) }
        )
      ).to.be.rejectedWith("INVALID_PAYMENT_AMOUNT");
    });

    it("we can't purchase a name with stable coin if we don't have funds", async () => {
      const [priceInStableCoin, ,] = await soulFactory.purchaseNameInfo();

      // set allowance for soul factory
      const usdc: ERC20 = ERC20__factory.connect(USDC_RINKEBY, owner);
      await usdc
        .connect(address2)
        .approve(soulFactory.address, priceInStableCoin);

      await expect(
        soulFactory.connect(address2).purchaseName(
          USDC_RINKEBY, // USDC
          SOUL_NAME
        )
      ).to.be.rejected;
    });

    it("we can't purchase a name with utility coin if we don't have funds", async () => {
      const [, , priceInUtilityToken] =
        await soulFactory.purchaseNameInfo();

      // set allowance for soul factory
      const usdc: ERC20 = ERC20__factory.connect(CORN_RINKEBY, owner);
      await usdc
        .connect(address2)
        .approve(soulFactory.address, priceInUtilityToken);

      await expect(
        soulFactory.connect(address2).purchaseName(
          CORN_RINKEBY, // $CORN
          SOUL_NAME
        )
      ).to.be.rejected;
    });
  });

  describe("use invalid payment method", () => {
    it("we can't use an invalid payment method", async () => {
      await expect(
        soulFactory.connect(address1).purchaseIdentity(
          address2.address // invalid payment method
        )
      ).to.be.rejectedWith('INVALID_PAYMENT_METHOD');
    });
  });
});
