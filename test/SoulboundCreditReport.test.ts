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
let someone: SignerWithAddress;

describe("Soulbound Credit Report", () => {
  before(async () => {
    [, owner, someone] = await ethers.getSigners();
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
    await soulboundIdentity.connect(owner).mint(someone.address);
  });

  describe("sbt information", () => {
    it("should be able to get sbt information", async () => {
      expect(await soulboundCreditReport.name()).to.equal("Masa Credit Report");

      expect(await soulboundCreditReport.symbol()).to.equal("MCR");
    });
  });

  describe("mint", () => {
    it("should mint from owner", async () => {
      await soulboundCreditReport.connect(owner).mint(someone.address);
    });

    it("should mint twice", async () => {
      await soulboundCreditReport.connect(owner).mint(someone.address);
      await soulboundCreditReport.connect(owner).mint(someone.address);

      expect(await soulboundCreditReport.totalSupply()).to.equal(2);
      expect(await soulboundCreditReport.tokenByIndex(0)).to.equal(0);
      expect(await soulboundCreditReport.tokenByIndex(1)).to.equal(1);
    });

    it("should fail to mint from someone", async () => {
      await expect(soulboundCreditReport.connect(someone).mint(someone.address))
        .to.be.rejected;
    });
  });

  describe("tokenUri", () => {
    it("should fail to transfer because its soulbound", async () => {
      const mintTx = await soulboundCreditReport
        .connect(owner)
        .mint(someone.address);

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
