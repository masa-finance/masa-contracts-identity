import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SoulFactory, SoulFactory__factory } from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulFactory: SoulFactory;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

const MINTING_IDENTITY_PRICE = "5000000"; // 5 USDC, with 6 decimals
const MINTING_NAME_PRICE = "3000000"; // 3 USDC, with 6 decimals

describe("Soul Factory", () => {
  before(async () => {
    [, owner, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulFactory", { fallbackToGlobal: false });

    const { address: soulFactoryAddress } = await deployments.get(
      "SoulFactory"
    );

    soulFactory = SoulFactory__factory.connect(soulFactoryAddress, owner);
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

    it("should set DefaultStableCoin from admin", async () => {
      await soulFactory.connect(owner).setDefaultStableCoin(address1.address);

      expect(await soulFactory.defaultStableCoin()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set DefaultStableCoin from non admin", async () => {
      await expect(
        soulFactory.connect(address1).setDefaultStableCoin(address1.address)
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
  });

  describe("purchase info", () => {
    it("we can get identity purchase info", async () => {
      const [priceInStableCoin, priceInETH, priceInUtilityToken] =
        await soulFactory.purchaseIdentityInfo();

      expect(priceInStableCoin).to.be.equal(MINTING_IDENTITY_PRICE);
      expect(priceInETH).to.be.equal(0);
      expect(priceInUtilityToken).to.be.equal(0);
    });

    it("we can get name purchase info", async () => {
      const [priceInStableCoin, priceInETH, priceInUtilityToken] =
        await soulFactory.purchaseNameInfo();

      expect(priceInStableCoin).to.be.equal(MINTING_NAME_PRICE);
      expect(priceInETH).to.be.equal(0);
      expect(priceInUtilityToken).to.be.equal(0);
    });
  });
});
