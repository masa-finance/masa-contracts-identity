import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments, getChainId } from "hardhat";
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
let address2: SignerWithAddress;

let identityId1: number;
let creditReport1: number;

describe("Soul Linker", () => {
  before(async () => {
    [, admin, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulboundCreditReport", {
      fallbackToGlobal: false
    });
    await deployments.fixture("SoulLinker", { fallbackToGlobal: false });

    const { address: soulboundIdentityAddress } = await deployments.get(
      "SoulboundIdentity"
    );
    const { address: soulboundCreditReportAddress } = await deployments.get(
      "SoulboundCreditReport"
    );
    const { address: soulLinkerAddress } = await deployments.get("SoulLinker");

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      admin
    );
    soulboundCreditReport = SoulboundCreditReport__factory.connect(
      soulboundCreditReportAddress,
      admin
    );
    soulLinker = SoulLinker__factory.connect(soulLinkerAddress, admin);

    // we mint identity SBT for address1
    let mintTx = await soulboundIdentity.connect(admin).mint(address1.address);
    let mintReceipt = await mintTx.wait();

    identityId1 = mintReceipt.events![0].args![2].toNumber();

    // we mint credit report SBT for address1
    mintTx = await soulboundCreditReport.connect(admin).mint(address1.address);
    mintReceipt = await mintTx.wait();

    creditReport1 = mintReceipt.events![0].args![2].toNumber();
  });

  describe("getLinkData", () => {
    it("getLinkData must work with a valid signature", async () => {
      const chainId = await getChainId();

      const signature = await address1._signTypedData(
        // Domain
        {
          name: "SoulLinker",
          version: "1.0.0",
          chainId: chainId,
          verifyingContract: soulLinker.address
        },
        // Types
        {
          Link: [
            { name: "reader", type: "address" },
            { name: "identityId", type: "uint256" },
            { name: "token", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "expirationDate", type: "uint256" }
          ]
        },
        // Value
        {
          reader: address2.address,
          identityId: identityId1,
          token: soulboundCreditReport.address,
          tokenId: creditReport1,
          expirationDate: Math.floor(Date.now() / 1000) + 60 * 15
        }
      );

      const isValid = await soulLinker.connect(address2).validateLinkData(
        address2.address,
        identityId1,
        soulboundCreditReport.address,
        creditReport1,
        Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
        signature
      );

      expect(isValid).to.be.true;
    });
  });
});
