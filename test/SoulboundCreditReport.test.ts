import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  SoulboundCreditScore,
  SoulboundCreditScore__factory,
  SoulboundIdentity,
  SoulboundIdentity__factory
} from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulboundIdentity: SoulboundIdentity;
let soulboundCreditScore: SoulboundCreditScore;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

let identityId1: number;

describe("Soulbound Credit Score", () => {
  before(async () => {
    [, owner, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulboundCreditScore", {
      fallbackToGlobal: false
    });

    const { address: soulboundIdentityAddress } = await deployments.get(
      "SoulboundIdentity"
    );
    const { address: soulboundCreditScoreAddress } = await deployments.get(
      "SoulboundCreditScore"
    );

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );
    soulboundCreditScore = SoulboundCreditScore__factory.connect(
      soulboundCreditScoreAddress,
      owner
    );

    // we mint identity SBT
    const mintTx = await soulboundIdentity
      .connect(owner)
      .mint(address1.address);
    const mintReceipt = await mintTx.wait();

    identityId1 = mintReceipt.events![0].args![1].toNumber();
  });

  describe("owner functions", () => {
    it("should set SoulboundIdentity from owner", async () => {
      await soulboundCreditScore
        .connect(owner)
        .setSoulboundIdentity(address1.address);

      expect(await soulboundCreditScore.soulboundIdentity()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set SoulboundIdentity from non owner", async () => {
      await expect(
        soulboundCreditScore
          .connect(address1)
          .setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });
  });

  describe("sbt information", () => {
    it("should be able to get sbt information", async () => {
      expect(await soulboundCreditScore.name()).to.equal("Masa Credit Score");

      expect(await soulboundCreditScore.symbol()).to.equal("MCS");
    });
  });

  describe("mint", () => {
    it("should mint from owner address", async () => {
      await soulboundCreditScore
        .connect(owner)
        ["mint(address)"](ethers.constants.AddressZero, address1.address);
    });

    it("should mint from owner identity", async () => {
      const mintTx = await soulboundCreditScore
        .connect(owner)
        ["mint(uint256)"](ethers.constants.AddressZero, identityId1);
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );
    });

    it("should mint twice", async () => {
      await soulboundCreditScore
        .connect(owner)
        ["mint(address)"](ethers.constants.AddressZero, address1.address);
      await soulboundCreditScore
        .connect(owner)
        ["mint(address)"](ethers.constants.AddressZero, address1.address);

      expect(await soulboundCreditScore.totalSupply()).to.equal(2);
      expect(await soulboundCreditScore.tokenByIndex(0)).to.equal(0);
      expect(await soulboundCreditScore.tokenByIndex(1)).to.equal(1);
    });

    it("should fail to mint from non minter", async () => {
      await expect(
        soulboundCreditScore
          .connect(address1)
          ["mint(address)"](ethers.constants.AddressZero, address1.address)
      ).to.be.rejected;
    });

    it("should fail to mint to address without identity", async () => {
      await expect(
        soulboundCreditScore
          .connect(owner)
          ["mint(address)"](ethers.constants.AddressZero, address2.address)
      ).to.be.rejected;
    });
  });

  describe("burn", () => {
    it("should burn", async () => {
      // we mint
      let mintTx = await soulboundCreditScore
        .connect(owner)
        ["mint(address)"](ethers.constants.AddressZero, address1.address);
      let mintReceipt = await mintTx.wait();
      const tokenId1 = mintReceipt.events![0].args![1].toNumber();

      // we mint again
      mintTx = await soulboundCreditScore
        .connect(owner)
        ["mint(address)"](ethers.constants.AddressZero, address1.address);
      mintReceipt = await mintTx.wait();
      const tokenId2 = mintReceipt.events![0].args![1].toNumber();

      expect(
        await soulboundCreditScore.balanceOf(address1.address)
      ).to.be.equal(2);
      expect(
        await soulboundCreditScore.balanceOf(address1.address)
      ).to.be.equal(2);
      expect(
        await soulboundCreditScore["ownerOf(uint256)"](tokenId1)
      ).to.be.equal(address1.address);
      expect(
        await soulboundCreditScore["ownerOf(uint256)"](tokenId2)
      ).to.be.equal(address1.address);

      await soulboundCreditScore.connect(address1).burn(tokenId1);

      expect(
        await soulboundCreditScore.balanceOf(address1.address)
      ).to.be.equal(1);

      await soulboundCreditScore.connect(address1).burn(tokenId2);

      expect(
        await soulboundCreditScore.balanceOf(address1.address)
      ).to.be.equal(0);
    });
  });

  describe("tokenUri", () => {
    it("should fail to transfer because its soulbound", async () => {
      const mintTx = await soulboundCreditScore
        .connect(owner)
        ["mint(address)"](ethers.constants.AddressZero, address1.address);

      const mintReceipt = await mintTx.wait();
      const tokenId = mintReceipt.events![0].args![1].toNumber();
      const tokenUri = await soulboundCreditScore.tokenURI(tokenId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/credit-score/");
    });
  });
});
