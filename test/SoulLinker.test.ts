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
import { BigNumber } from "ethers";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulboundIdentity: SoulboundIdentity;
let soulboundCreditReport: SoulboundCreditReport;
let soulLinker: SoulLinker;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

let ownerIdentityId: number;
let readerIdentityId: number;
let creditReport1: number;

describe("Soul Linker", () => {
  before(async () => {
    [, owner, address1, address2] = await ethers.getSigners();
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
      owner
    );
    soulboundCreditReport = SoulboundCreditReport__factory.connect(
      soulboundCreditReportAddress,
      owner
    );
    soulLinker = SoulLinker__factory.connect(soulLinkerAddress, owner);

    // we mint identity SBT for address1
    let mintTx = await soulboundIdentity.connect(owner).mint(address1.address);
    let mintReceipt = await mintTx.wait();

    ownerIdentityId = mintReceipt.events![0].args![1].toNumber();

    // we mint identity SBT for address2
    mintTx = await soulboundIdentity.connect(owner).mint(address2.address);
    mintReceipt = await mintTx.wait();

    readerIdentityId = mintReceipt.events![0].args![1].toNumber();

    // we mint credit report SBT for address1
    mintTx = await soulboundCreditReport.connect(owner).mint(address1.address);
    mintReceipt = await mintTx.wait();

    creditReport1 = mintReceipt.events![0].args![1].toNumber();
  });

  describe("owner functions", () => {
    it("should set SoulboundIdentity from owner", async () => {
      await soulLinker.connect(owner).setSoulboundIdentity(address1.address);

      expect(await soulLinker.soulboundIdentity()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set SoulboundIdentity from non owner", async () => {
      await expect(
        soulLinker.connect(address1).setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });

    it("should add linked SBT from owner", async () => {
      await soulLinker.connect(owner).addLinkedSBT(address1.address);

      expect(await soulLinker.linkedSBT(address1.address)).to.be.true;
    });

    it("should fail to add linked SBT from non owner", async () => {
      await expect(soulLinker.connect(address1).addLinkedSBT(address1.address))
        .to.be.rejected;
    });

    it("should fail to add already existing linked SBT from owner", async () => {
      await expect(
        soulLinker.connect(owner).addLinkedSBT(soulboundCreditReport.address)
      ).to.be.rejected;
    });

    it("should remove linked SBT from owner", async () => {
      await soulLinker
        .connect(owner)
        .removeLinkedSBT(soulboundCreditReport.address);

      expect(await soulLinker.linkedSBT(soulboundCreditReport.address)).to.be
        .false;
    });

    it("should fail to remove linked SBT from non owner", async () => {
      await expect(
        soulLinker
          .connect(address1)
          .removeLinkedSBT(soulboundCreditReport.address)
      ).to.be.rejected;
    });

    it("should fail to remove non existing linked SBT from owner", async () => {
      await expect(soulLinker.connect(owner).removeLinkedSBT(address1.address))
        .to.be.rejected;
    });
  });

  describe("read link information", () => {
    it("should get identity id", async () => {
      expect(
        await soulLinker.getIdentityId(
          soulboundCreditReport.address,
          creditReport1
        )
      ).to.be.equal(ownerIdentityId);
    });

    it("should get SBT links by identityId", async () => {
      expect(
        await soulLinker["getSBTLinks(uint256,address)"](
          ownerIdentityId,
          soulboundCreditReport.address
        )
      ).to.deep.equal([BigNumber.from(creditReport1)]);
    });

    it("should get SBT links by owner address", async () => {
      expect(
        await soulLinker["getSBTLinks(address,address)"](
          address1.address,
          soulboundCreditReport.address
        )
      ).to.deep.equal([BigNumber.from(creditReport1)]);
    });
  });

  describe("addPermission", () => {
    it("addPermission must work with a valid signature", async () => {
      const chainId = await getChainId();
      const signatureDate = Math.floor(Date.now() / 1000);
      const expirationDate = Math.floor(Date.now() / 1000) + 60 * 15;
      const data = '{"data1","data2"}';

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
            { name: "readerIdentityId", type: "uint256" },
            { name: "ownerIdentityId", type: "uint256" },
            { name: "token", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "data", type: "string" },
            { name: "signatureDate", type: "uint256" },
            { name: "expirationDate", type: "uint256" }
          ]
        },
        // Value
        {
          readerIdentityId: readerIdentityId,
          ownerIdentityId: ownerIdentityId,
          token: soulboundCreditReport.address,
          tokenId: creditReport1,
          data: data,
          signatureDate: signatureDate,
          expirationDate: expirationDate
        }
      );

      await soulLinker
        .connect(address1)
        .addPermission(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditReport.address,
          creditReport1,
          data,
          signatureDate,
          expirationDate,
          signature
        );

      const dataWithPermissions = await soulLinker
        .connect(address2)
        .validatePermission(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditReport.address,
          creditReport1,
          signatureDate
        );

      expect(dataWithPermissions).to.be.equal(data);
    });

    it("addPermission won't work with an invalid signature", async () => {
      const chainId = await getChainId();
      const signatureDate = Math.floor(Date.now() / 1000);
      const expirationDate = Math.floor(Date.now() / 1000) + 60 * 15;
      const data = '{"data1","data2"}';

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
            { name: "readerIdentityId", type: "uint256" },
            { name: "ownerIdentityId", type: "uint256" },
            { name: "token", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "data", type: "string" },
            { name: "signatureDate", type: "uint256" },
            { name: "expirationDate", type: "uint256" }
          ]
        },
        // Value
        {
          readerIdentityId: ownerIdentityId,
          ownerIdentityId: ownerIdentityId,
          token: soulboundCreditReport.address,
          tokenId: creditReport1,
          data: data,
          signatureDate: signatureDate,
          expirationDate: expirationDate
        }
      );

      await expect(
        soulLinker
          .connect(address1)
          .addPermission(
            readerIdentityId,
            ownerIdentityId,
            soulboundCreditReport.address,
            creditReport1,
            data,
            signatureDate,
            expirationDate,
            signature
          )
      ).to.be.rejected;

      await expect(
        soulLinker
          .connect(address2)
          .validatePermission(
            readerIdentityId,
            ownerIdentityId,
            soulboundCreditReport.address,
            creditReport1,
            signatureDate
          )
      ).to.be.rejected;
    });
  });
});
