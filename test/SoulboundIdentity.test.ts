import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SoulboundIdentity, SoulboundIdentity__factory } from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulboundIdentity: SoulboundIdentity;

let soulNameContractAddress: string;

let owner: SignerWithAddress;
let someone: SignerWithAddress;

const SOULBOUND_NAME1 = "soulName1";
const SOULBOUND_NAME2 = "soulName2";

let address1: SignerWithAddress;
let address2: SignerWithAddress;

describe("Soulbound Identity", () => {
  before(async () => {
    [, owner, someone, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulName", { fallbackToGlobal: false });

    const { address: soulboundIdentityAddress } = await deployments.get(
      "SoulboundIdentity"
    );
    const { address: soulNameAddress } = await deployments.get("SoulName");
    soulNameContractAddress = soulNameAddress;

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );
  });

  describe("mint", () => {
    it("should mint from owner", async () => {
      await soulboundIdentity.connect(owner).mint(someone.address);
    });

    it("should fail to mint twice", async () => {
      await soulboundIdentity.connect(owner).mint(someone.address);
      await expect(
        soulboundIdentity.connect(owner).mint(someone.address)
      ).to.be.rejectedWith("Soulbound identity already created!");
    });

    it("should fail to mint from someone", async () => {
      await expect(soulboundIdentity.connect(someone).mint(someone.address)).to
        .be.rejected;
    });
  });

  describe("mintIdentityWithName", () => {
    it("should mint from owner", async () => {
      await soulboundIdentity
        .connect(owner)
        .mintIdentityWithName(address1.address, SOULBOUND_NAME1);
    });

    it("should fail to mint from someone", async () => {
      await expect(
        soulboundIdentity
          .connect(address1)
          .mintIdentityWithName(address1.address, SOULBOUND_NAME1)
      ).to.be.rejected;
    });

    it("should fail to mint twice", async () => {
      await soulboundIdentity
        .connect(owner)
        .mintIdentityWithName(address1.address, SOULBOUND_NAME1);
      await expect(
        soulboundIdentity
          .connect(owner)
          .mintIdentityWithName(address1.address, SOULBOUND_NAME2)
      ).to.be.rejectedWith("Soulbound identity already created!");
    });

    it("should fail to mint duplicated name", async () => {
      await soulboundIdentity
        .connect(owner)
        .mintIdentityWithName(address1.address, SOULBOUND_NAME1);
      await expect(
        soulboundIdentity
          .connect(owner)
          .mintIdentityWithName(address2.address, SOULBOUND_NAME1)
      ).to.be.rejectedWith("NAME_ALREADY_EXISTS");
    });
  });

  describe("burn", () => {
    it("should burn", async () => {
      const mintTx = await soulboundIdentity
        .connect(owner)
        .mint(someone.address);
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![2].toNumber();

      expect(await soulboundIdentity.balanceOf(someone.address)).to.be.equal(1);
      expect(await soulboundIdentity["ownerOf(uint256)"](tokenId)).to.be.equal(
        someone.address
      );

      await soulboundIdentity.connect(someone).burn(tokenId);

      expect(await soulboundIdentity.balanceOf(someone.address)).to.be.equal(0);
    });
  });

  describe("transfer", () => {
    it("should fail to transfer because its soulbound", async () => {
      await soulboundIdentity.connect(owner).mint(someone.address);

      await expect(
        soulboundIdentity
          .connect(someone)
          .transferFrom(someone.address, someone.address, 1)
      ).to.be.rejectedWith("Transferring soulbound Tokens is not permitted!");
    });
  });

  describe("tokenURI", () => {
    it("should get a valid token URI", async () => {
      const mintTx = await soulboundIdentity
        .connect(owner)
        .mint(someone.address);

      const mintReceipt = await mintTx.wait();
      const tokenId = mintReceipt.events![0].args![2].toNumber();
      const tokenUri = await soulboundIdentity["tokenURI(uint256)"](tokenId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/identity/");
    });
  });
});
