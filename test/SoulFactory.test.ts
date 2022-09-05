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
  });

  describe("purchase info", () => {
    it("we can get purchase info", async () => {
      console.log(await soulFactory.purchaseIdentityInfo());
    });
  });
});
