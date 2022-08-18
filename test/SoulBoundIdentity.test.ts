import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SoulBoundIdentity, SoulBoundIdentity__factory } from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulBoundIdentity: SoulBoundIdentity;

let owner: SignerWithAddress;
let someone: SignerWithAddress;

describe("Soulbound Identity", () => {
  before(async () => {
    [, owner, someone] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulBoundIdentity", { fallbackToGlobal: false });

    const { address: soulBoundIdentityAddress } = await deployments.get(
      "SoulBoundIdentity"
    );
    soulBoundIdentity = SoulBoundIdentity__factory.connect(
      soulBoundIdentityAddress,
      owner
    );
  });

  describe("mint", () => {
    it("should mint from owner", async () => {
      await soulBoundIdentity.connect(owner).mint(someone.address);
    });

    it("should fail to mint twice", async () => {
      await soulBoundIdentity.connect(owner).mint(someone.address);
      await expect(
        soulBoundIdentity.connect(owner).mint(someone.address)
      ).to.be.rejectedWith("Soulbound identity already created!");
    });

    it("should fail to mint from someone", async () => {
      await expect(soulBoundIdentity.connect(someone).mint(someone.address)).to
        .be.rejected;
    });
  });

  describe("burn", () => {
    it("should burn", async () => {
      const mintTx = await soulBoundIdentity
        .connect(owner)
        .mint(someone.address);
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![2].toNumber();

      expect(await soulBoundIdentity.balanceOf(someone.address)).to.be.equal(1);
      expect(await soulBoundIdentity.ownerOf(tokenId)).to.be.equal(
        someone.address
      );

      await soulBoundIdentity.connect(someone).burn(tokenId);

      expect(await soulBoundIdentity.balanceOf(someone.address)).to.be.equal(0);
    });
  });

  describe("transfer", () => {
    it("should fail to transfer because its soulbound", async () => {
      await soulBoundIdentity.connect(owner).mint(someone.address);

      await expect(
        soulBoundIdentity
          .connect(someone)
          .transferFrom(someone.address, someone.address, 1)
      ).to.be.rejectedWith("Transferring soulbound Tokens is not permitted!");
    });
  });

  describe("tokenURI", () => {
    it("should get a valid token URI", async () => {
      const mintTx = await soulBoundIdentity
        .connect(owner)
        .mint(someone.address);

      const mintReceipt = await mintTx.wait();
      const tokenId = mintReceipt.events![0].args![2].toNumber();
      const tokenUri = await soulBoundIdentity.tokenURI(tokenId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/identity/");
    });
  });
});
