import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  SoulboundCreditReport,
  SoulboundCreditReport__factory
} from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulboundCreditReport: SoulboundCreditReport;

let owner: SignerWithAddress;
let someone: SignerWithAddress;

describe("Soulbound Credit Report", () => {
  before(async () => {
    [owner, someone] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundCreditReport", {
      fallbackToGlobal: false
    });

    const { address: soulboundCreditReportAddress } = await deployments.get(
      "SoulboundCreditReport"
    );
    soulboundCreditReport = SoulboundCreditReport__factory.connect(
      soulboundCreditReportAddress,
      owner
    );
  });

  describe("mint", () => {
    it("should mint from owner", async () => {
      await soulboundCreditReport.connect(owner).mint(someone.address);
    });

    it("should mint twice", async () => {
      await soulboundCreditReport.connect(owner).mint(someone.address);
      await soulboundCreditReport.connect(owner).mint(someone.address);
    });

    it("should fail to mint from someone", async () => {
      await expect(soulboundCreditReport.connect(someone).mint(someone.address))
        .to.be.rejected;
    });
  });

  describe("transfer", () => {
    it("should fail to transfer because its soulbound", async () => {
      await soulboundCreditReport.connect(owner).mint(someone.address);

      await expect(
        soulboundCreditReport
          .connect(someone)
          .transferFrom(someone.address, someone.address, 1)
      ).to.be.rejectedWith("Transferring soulbound Tokens is not permitted!");
    });
  });

  describe("tokenUri", () => {
    it("should fail to transfer because its soulbound", async () => {
      const mintTx = await soulboundCreditReport
        .connect(owner)
        .mint(someone.address);

      const mintReceipt = await mintTx.wait();
      const tokenId = mintReceipt.events![0].args![2].toNumber();
      const tokenUri = await soulboundCreditReport.tokenURI(tokenId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/credit-report/");
    });
  });
});
