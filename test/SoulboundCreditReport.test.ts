import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  SoulboundCreditReport,
  SoulboundCreditReport__factory,
  SoulboundIdentity,
  SoulboundIdentity__factory
} from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulboundIdentity: SoulboundIdentity;
let soulboundCreditReport: SoulboundCreditReport;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

let identityId1: number;

describe("Soulbound Credit Report", () => {
  before(async () => {
    [, owner, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulboundCreditReport", {
      fallbackToGlobal: false
    });

    const { address: soulboundIdentityAddress } = await deployments.get(
      "SoulboundIdentity"
    );
    const { address: soulboundCreditReportAddress } = await deployments.get(
      "SoulboundCreditReport"
    );

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );
    soulboundCreditReport = SoulboundCreditReport__factory.connect(
      soulboundCreditReportAddress,
      owner
    );

    // we mint identity SBT
    let mintTx = await soulboundIdentity.connect(owner).mint(address1.address);
    let mintReceipt = await mintTx.wait();

    identityId1 = mintReceipt.events![0].args![1].toNumber();
  });

  describe("owner functions", () => {
    it("should set SoulboundIdentity from owner", async () => {
      await soulboundCreditReport
        .connect(owner)
        .setSoulboundIdentity(address1.address);

      expect(await soulboundCreditReport.soulboundIdentity()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set SoulboundIdentity from non owner", async () => {
      await expect(
        soulboundCreditReport
          .connect(address1)
          .setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });
  });

  describe("sbt information", () => {
    it("should be able to get sbt information", async () => {
      expect(await soulboundCreditReport.name()).to.equal("Masa Credit Report");

      expect(await soulboundCreditReport.symbol()).to.equal("MCR");
    });
  });

  describe("mint", () => {
    it("should mint from owner address", async () => {
      await soulboundCreditReport
        .connect(owner)
        ["mint(address)"](address1.address);
    });

    it("should mint from owner identity", async () => {
      await soulboundCreditReport.connect(owner)["mint(uint256)"](identityId1);
    });

    it("should mint twice", async () => {
      await soulboundCreditReport
        .connect(owner)
        ["mint(address)"](address1.address);
      await soulboundCreditReport
        .connect(owner)
        ["mint(address)"](address1.address);

      expect(await soulboundCreditReport.totalSupply()).to.equal(2);
      expect(await soulboundCreditReport.tokenByIndex(0)).to.equal(0);
      expect(await soulboundCreditReport.tokenByIndex(1)).to.equal(1);
    });

    it("should fail to mint from non minter", async () => {
      await expect(
        soulboundCreditReport
          .connect(address1)
          ["mint(address)"](address1.address)
      ).to.be.rejected;
    });

    it("should fail to mint to address without identity", async () => {
      await expect(
        soulboundCreditReport.connect(owner)["mint(address)"](address2.address)
      ).to.be.rejected;
    });
  });

  describe("burn", () => {
    it("should burn", async () => {
      // we mint
      let mintTx = await soulboundCreditReport
        .connect(owner)
        ["mint(address)"](address1.address);
      let mintReceipt = await mintTx.wait();
      const tokenId1 = mintReceipt.events![0].args![1].toNumber();

      // we mint again
      mintTx = await soulboundCreditReport
        .connect(owner)
        ["mint(address)"](address1.address);
      mintReceipt = await mintTx.wait();
      const tokenId2 = mintReceipt.events![0].args![1].toNumber();

      expect(
        await soulboundCreditReport.balanceOf(address1.address)
      ).to.be.equal(2);
      expect(
        await soulboundCreditReport["ownerOf(uint256)"](tokenId1)
      ).to.be.equal(address1.address);
      expect(
        await soulboundCreditReport["ownerOf(uint256)"](tokenId2)
      ).to.be.equal(address1.address);

      await soulboundCreditReport.connect(address1).burn(tokenId1);

      expect(
        await soulboundCreditReport.balanceOf(address1.address)
      ).to.be.equal(1);

      await soulboundCreditReport.connect(address1).burn(tokenId2);

      expect(
        await soulboundCreditReport.balanceOf(address1.address)
      ).to.be.equal(0);
    });
  });

  describe("tokenUri", () => {
    it("should fail to transfer because its soulbound", async () => {
      const mintTx = await soulboundCreditReport
        .connect(owner)
        ["mint(address)"](address1.address);

      const mintReceipt = await mintTx.wait();
      const tokenId = mintReceipt.events![0].args![1].toNumber();
      const tokenUri = await soulboundCreditReport.tokenURI(tokenId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/credit-report/");
    });
  });
});
