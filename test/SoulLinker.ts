import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  SoulboundCreditReport,
  SoulboundCreditReport__factory,
  SoulboundIdentity,
  SoulboundIdentity__factory,
  SoulLinker,
  SoulLinker__factory
} from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulboundIdentity: SoulboundIdentity;
let soulboundCreditReport: SoulboundCreditReport;
let soulLinker: SoulLinker;

let admin: SignerWithAddress;
let address1: SignerWithAddress;

describe("Soulbound Credit Report", () => {
  before(async () => {
    [, admin, address1] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulLinker", { fallbackToGlobal: false });
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
    const { address: soulLinkerAddress } = await deployments.get(
      "SoulLinker"
    );

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      admin
    );
    soulboundCreditReport = SoulboundCreditReport__factory.connect(
      soulboundCreditReportAddress,
      admin
    );
    soulLinker = SoulLinker__factory.connect(
      soulLinkerAddress,
      admin
    );

    // we mint identity SBT and credit report SBT
    await soulboundIdentity.connect(admin).mint(address1.address);
    await soulboundCreditReport.connect(admin).mint(address1.address);
  });

  describe("tokenUri", () => {
    it("should fail to transfer because its soulbound", async () => {
      const mintTx = await soulboundCreditReport
        .connect(admin)
        .mint(address1.address);

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
