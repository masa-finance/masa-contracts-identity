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
let someone: SignerWithAddress;

describe("Soulbound Credit Score", () => {
  before(async () => {
    [, owner, someone] = await ethers.getSigners();
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
    await soulboundIdentity.connect(owner).mint(someone.address);
  });

  describe("sbt information", () => {
    it("should be able to get sbt information", async () => {
      expect(await soulboundCreditScore.name()).to.equal("Masa Credit Score");

      expect(await soulboundCreditScore.symbol()).to.equal("MCS");
    });
  });

  describe("mint", () => {
    it("should mint from owner", async () => {
      await soulboundCreditScore.connect(owner).mint(someone.address);
    });

    it("should mint twice", async () => {
      await soulboundCreditScore.connect(owner).mint(someone.address);
      await soulboundCreditScore.connect(owner).mint(someone.address);

      expect(await soulboundCreditScore.totalSupply()).to.equal(2);
      expect(await soulboundCreditScore.tokenByIndex(0)).to.equal(0);
      expect(await soulboundCreditScore.tokenByIndex(1)).to.equal(1);
    });

    it("should fail to mint from someone", async () => {
      await expect(soulboundCreditScore.connect(someone).mint(someone.address))
        .to.be.rejected;
    });
  });

  describe("burn", () => {
    it("should burn", async () => {
      // we mint
      let mintTx = await soulboundCreditScore
        .connect(owner)
        .mint(someone.address);
      let mintReceipt = await mintTx.wait();
      const tokenId1 = mintReceipt.events![0].args![1].toNumber();

      // we mint again
      mintTx = await soulboundCreditScore.connect(owner).mint(someone.address);
      mintReceipt = await mintTx.wait();
      const tokenId2 = mintReceipt.events![0].args![1].toNumber();

      expect(await soulboundCreditScore.balanceOf(someone.address)).to.be.equal(
        2
      );
      expect(
        await soulboundCreditScore["ownerOf(uint256)"](tokenId1)
      ).to.be.equal(someone.address);
      expect(
        await soulboundCreditScore["ownerOf(uint256)"](tokenId2)
      ).to.be.equal(someone.address);

      await soulboundCreditScore.connect(someone).burn(tokenId1);

      expect(await soulboundCreditScore.balanceOf(someone.address)).to.be.equal(
        1
      );

      await soulboundCreditScore.connect(someone).burn(tokenId2);

      expect(await soulboundCreditScore.balanceOf(someone.address)).to.be.equal(
        0
      );
    });
  });

  describe("tokenUri", () => {
    it("should fail to transfer because its soulbound", async () => {
      const mintTx = await soulboundCreditScore
        .connect(owner)
        .mint(someone.address);

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
