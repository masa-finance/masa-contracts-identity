import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments, getChainId } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  SoulboundCreditScore,
  SoulboundCreditScore__factory,
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
let soulboundCreditScore: SoulboundCreditScore;
let soulLinker: SoulLinker;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

let ownerIdentityId: number;
let readerIdentityId: number;
let creditScore1: number;

describe("Soul Linker", () => {
  before(async () => {
    [, owner, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulboundCreditScore", {
      fallbackToGlobal: false
    });
    await deployments.fixture("SoulLinker", { fallbackToGlobal: false });

    const { address: soulboundIdentityAddress } = await deployments.get(
      "SoulboundIdentity"
    );
    const { address: soulboundCreditScoreAddress } = await deployments.get(
      "SoulboundCreditScore"
    );
    const { address: soulLinkerAddress } = await deployments.get("SoulLinker");

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );
    soulboundCreditScore = SoulboundCreditScore__factory.connect(
      soulboundCreditScoreAddress,
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
    mintTx = await soulboundCreditScore
      .connect(owner)
      ["mint(address)"](address1.address);
    mintReceipt = await mintTx.wait();

    creditScore1 = mintReceipt.events![0].args![1].toNumber();
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
        soulLinker.connect(owner).addLinkedSBT(soulboundCreditScore.address)
      ).to.be.rejected;
    });

    it("should remove linked SBT from owner", async () => {
      await soulLinker
        .connect(owner)
        .removeLinkedSBT(soulboundCreditScore.address);

      expect(await soulLinker.linkedSBT(soulboundCreditScore.address)).to.be
        .false;
    });

    it("should fail to remove linked SBT from non owner", async () => {
      await expect(
        soulLinker
          .connect(address1)
          .removeLinkedSBT(soulboundCreditScore.address)
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
          soulboundCreditScore.address,
          creditScore1
        )
      ).to.be.equal(ownerIdentityId);
    });

    it("should get SBT links by identityId", async () => {
      expect(
        await soulLinker["getSBTLinks(uint256,address)"](
          ownerIdentityId,
          soulboundCreditScore.address
        )
      ).to.deep.equal([BigNumber.from(creditScore1)]);
    });

    it("should get SBT links by owner address", async () => {
      expect(
        await soulLinker["getSBTLinks(address,address)"](
          address1.address,
          soulboundCreditScore.address
        )
      ).to.deep.equal([BigNumber.from(creditScore1)]);
    });
  });

  describe("validateLinkData", () => {
    it("validateLinkData must work with a valid signature", async () => {
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
            { name: "readerIdentityId", type: "uint256" },
            { name: "ownerIdentityId", type: "uint256" },
            { name: "token", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "expirationDate", type: "uint256" }
          ]
        },
        // Value
        {
          readerIdentityId: readerIdentityId,
          ownerIdentityId: ownerIdentityId,
          token: soulboundCreditScore.address,
          tokenId: creditScore1,
          expirationDate: Math.floor(Date.now() / 1000) + 60 * 15
        }
      );

      const isValid = await soulLinker.connect(address2).validateLinkData(
        readerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1,
        Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
        signature
      );

      expect(isValid).to.be.true;
    });

    it("validateLinkData won't work with an invalid signature", async () => {
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
            { name: "readerIdentityId", type: "uint256" },
            { name: "ownerIdentityId", type: "uint256" },
            { name: "token", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "expirationDate", type: "uint256" }
          ]
        },
        // Value
        {
          readerIdentityId: ownerIdentityId,
          ownerIdentityId: ownerIdentityId,
          token: soulboundCreditScore.address,
          tokenId: creditScore1,
          expirationDate: Math.floor(Date.now() / 1000) + 60 * 15
        }
      );

      await expect(
        soulLinker.connect(address2).validateLinkData(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
          signature
        )
      ).to.be.rejected;
    });
  });
});
