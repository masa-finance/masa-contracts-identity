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

let admin: SignerWithAddress;
let someone: SignerWithAddress;

describe("Soulbound Credit Report", () => {
  before(async () => {
    [, admin, someone] = await ethers.getSigners();
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
      admin
    );
    soulboundCreditReport = SoulboundCreditReport__factory.connect(
      soulboundCreditReportAddress,
      admin
    );

    // we mint identity SBT
    await soulboundIdentity.connect(admin).mint(someone.address);
  });

  describe("mint", () => {
    it("should mint from admin", async () => {
      await soulboundCreditReport.connect(admin).mint(someone.address);
    });

    it("should mint twice", async () => {
      await soulboundCreditReport.connect(admin).mint(someone.address);
      await soulboundCreditReport.connect(admin).mint(someone.address);
    });

    it("should fail to mint from someone", async () => {
      await expect(soulboundCreditReport.connect(someone).mint(someone.address))
        .to.be.rejected;
    });
  });

  describe("transfer", () => {
    it("should fail to transfer because its soulbound", async () => {
      await soulboundCreditReport.connect(admin).mint(someone.address);

      await expect(
        soulboundCreditReport
          .connect(someone)
          .transferFrom(someone.address, someone.address, 1)
      ).to.be.rejectedWith("SBT_TRANSFER_NOT_PERMITTED");

      await expect(
        soulboundCreditReport
          .connect(someone)
          ["safeTransferFrom(address,address,uint256)"](
            someone.address,
            someone.address,
            1
          )
      ).to.be.rejectedWith("SBT_TRANSFER_NOT_PERMITTED");

      await expect(
        soulboundCreditReport
          .connect(someone)
          ["safeTransferFrom(address,address,uint256,bytes)"](
            someone.address,
            someone.address,
            1,
            []
          )
      ).to.be.rejectedWith("SBT_TRANSFER_NOT_PERMITTED");
    });
  });

  describe("tokenUri", () => {
    it("should fail to transfer because its soulbound", async () => {
      const mintTx = await soulboundCreditReport
        .connect(admin)
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
