import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  Soulbound2FA,
  Soulbound2FA__factory,
  SoulboundIdentity,
  SoulboundIdentity__factory
} from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulboundIdentity: SoulboundIdentity;
let soulbound2FA: Soulbound2FA;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

let identityId1: number;

describe("Soulbound Two-factor authentication (2FA)", () => {
  before(async () => {
    [, owner, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: true });
    await deployments.fixture("Soulbound2FA", {
      fallbackToGlobal: true
    });

    const { address: soulboundIdentityAddress } = await deployments.get(
      "SoulboundIdentity"
    );
    const { address: soulbound2FAAddress } = await deployments.get(
      "Soulbound2FA"
    );

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );
    soulbound2FA = Soulbound2FA__factory.connect(soulbound2FAAddress, owner);

    // we mint identity SBT
    const mintTx = await soulboundIdentity
      .connect(owner)
      .mint(address1.address);
    const mintReceipt = await mintTx.wait();

    identityId1 = mintReceipt.events![0].args![1].toNumber();
  });

  describe("owner functions", () => {
    it("should set SoulboundIdentity from owner", async () => {
      await soulbound2FA.connect(owner).setSoulboundIdentity(address1.address);

      expect(await soulbound2FA.soulboundIdentity()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set SoulboundIdentity from non owner", async () => {
      await expect(
        soulbound2FA.connect(address1).setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });
  });

  describe("sbt information", () => {
    it("should be able to get sbt information", async () => {
      expect(await soulbound2FA.name()).to.equal("Masa 2FA");

      expect(await soulbound2FA.symbol()).to.equal("M2F");
    });
  });

  describe("mint", () => {
    it("should mint from owner address", async () => {
      await soulbound2FA
        .connect(owner)
        ["mint(address,address)"](
          ethers.constants.AddressZero,
          address1.address
        );
    });

    it("should mint from owner identity", async () => {
      const mintTx = await soulbound2FA
        .connect(owner)
        ["mint(address,uint256)"](ethers.constants.AddressZero, identityId1);
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulbound2FA.getIdentityId(tokenId)).to.equal(identityId1);
    });

    it("should mint twice", async () => {
      await soulbound2FA
        .connect(owner)
        ["mint(address,address)"](
          ethers.constants.AddressZero,
          address1.address
        );
      await soulbound2FA
        .connect(owner)
        ["mint(address,address)"](
          ethers.constants.AddressZero,
          address1.address
        );

      expect(await soulbound2FA.totalSupply()).to.equal(2);
      expect(await soulbound2FA.tokenByIndex(0)).to.equal(0);
      expect(await soulbound2FA.tokenByIndex(1)).to.equal(1);
    });

    it("should fail to mint from non minter", async () => {
      await expect(
        soulbound2FA
          .connect(address1)
          ["mint(address,address)"](
            ethers.constants.AddressZero,
            address1.address
          )
      ).to.be.rejected;
    });

    it("should fail to mint to address without identity", async () => {
      await expect(
        soulbound2FA
          .connect(owner)
          ["mint(address,address)"](
            ethers.constants.AddressZero,
            address2.address
          )
      ).to.be.rejected;
    });
  });

  describe("burn", () => {
    it("should burn", async () => {
      // we mint
      let mintTx = await soulbound2FA
        .connect(owner)
        ["mint(address,address)"](
          ethers.constants.AddressZero,
          address1.address
        );
      let mintReceipt = await mintTx.wait();
      const tokenId1 = mintReceipt.events![0].args![1].toNumber();

      // we mint again
      mintTx = await soulbound2FA
        .connect(owner)
        ["mint(address,address)"](
          ethers.constants.AddressZero,
          address1.address
        );
      mintReceipt = await mintTx.wait();
      const tokenId2 = mintReceipt.events![0].args![1].toNumber();

      expect(await soulbound2FA.balanceOf(address1.address)).to.be.equal(2);
      expect(await soulbound2FA["ownerOf(uint256)"](tokenId1)).to.be.equal(
        address1.address
      );
      expect(await soulbound2FA["ownerOf(uint256)"](tokenId2)).to.be.equal(
        address1.address
      );

      await soulbound2FA.connect(address1).burn(tokenId1);

      expect(await soulbound2FA.balanceOf(address1.address)).to.be.equal(1);

      await soulbound2FA.connect(address1).burn(tokenId2);

      expect(await soulbound2FA.balanceOf(address1.address)).to.be.equal(0);
    });
  });

  describe("tokenUri", () => {
    it("should get a valid token URI from its tokenId", async () => {
      const mintTx = await soulbound2FA
        .connect(owner)
        ["mint(address,address)"](
          ethers.constants.AddressZero,
          address1.address
        );

      const mintReceipt = await mintTx.wait();
      const tokenId = mintReceipt.events![0].args![1].toNumber();
      const tokenUri = await soulbound2FA.tokenURI(tokenId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/2fa/");
    });
  });
});
