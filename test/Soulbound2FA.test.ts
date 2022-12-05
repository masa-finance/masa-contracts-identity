import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments, getChainId } from "hardhat";
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
let authority: SignerWithAddress;

let identityId1: number;

const signatureDate = Math.floor(Date.now() / 1000);

let signature: string;

const signMintCreditScore = async (
  identityId: number,
  authoritySigner: SignerWithAddress
) => {
  const chainId = await getChainId();

  const signature = await authoritySigner._signTypedData(
    // Domain
    {
      name: "Soulbound2FA",
      version: "1.0.0",
      chainId: chainId,
      verifyingContract: soulbound2FA.address
    },
    // Types
    {
      Mint2FA: [
        { name: "identityId", type: "uint256" },
        { name: "authorityAddress", type: "address" },
        { name: "signatureDate", type: "uint256" }
      ]
    },
    // Value
    {
      identityId: identityId,
      authorityAddress: authoritySigner.address,
      signatureDate: signatureDate
    }
  );

  return signature;
};

describe("Soulbound Two-factor authentication (2FA)", () => {
  before(async () => {
    [, owner, address1, address2, authority] = await ethers.getSigners();
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

    // we add authority account
    await soulbound2FA.addAuthority(authority.address);

    signature = await signMintCreditScore(identityId1, authority);
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
    it("should fail to mint from owner address", async () => {
      await expect(
        soulbound2FA
          .connect(owner)
          ["mint(address,address,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            address1.address,
            authority.address,
            signatureDate,
            signature
          )
      ).to.be.revertedWith("CALLER_NOT_OWNER");
    });

    it("should fail to mint from owner identity", async () => {
      await expect(
        soulbound2FA
          .connect(owner)
          ["mint(address,uint256,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            identityId1,
            authority.address,
            signatureDate,
            signature
          )
      ).to.be.revertedWith("CALLER_NOT_OWNER");
    });

    it("should mint twice", async () => {
      await soulbound2FA
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signature
        );
      await soulbound2FA
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signature
        );

      expect(await soulbound2FA.totalSupply()).to.equal(2);
      expect(await soulbound2FA.tokenByIndex(0)).to.equal(0);
      expect(await soulbound2FA.tokenByIndex(1)).to.equal(1);
    });

    it("should mint from final user address", async () => {
      const mintTx = await soulbound2FA
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signature
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulbound2FA.getIdentityId(tokenId)).to.equal(
        identityId1
      );
    });

    it("should mint from final user identity", async () => {
      const mintTx = await soulbound2FA
        .connect(address1)
        ["mint(address,uint256,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          identityId1,
          authority.address,
          signatureDate,
          signature
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulbound2FA.getIdentityId(tokenId)).to.equal(
        identityId1
      );
    });
  });

  describe("burn", () => {
    it("should burn", async () => {
      // we mint
      let mintTx = await soulbound2FA
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signature
        );
      let mintReceipt = await mintTx.wait();
      const tokenId1 = mintReceipt.events![0].args![1].toNumber();

      // we mint again
      mintTx = await soulbound2FA
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signature
        );
      mintReceipt = await mintTx.wait();
      const tokenId2 = mintReceipt.events![0].args![1].toNumber();

      expect(
        await soulbound2FA.balanceOf(address1.address)
      ).to.be.equal(2);
      expect(
        await soulbound2FA.balanceOf(address1.address)
      ).to.be.equal(2);
      expect(
        await soulbound2FA["ownerOf(uint256)"](tokenId1)
      ).to.be.equal(address1.address);
      expect(
        await soulbound2FA["ownerOf(uint256)"](tokenId2)
      ).to.be.equal(address1.address);

      await soulbound2FA.connect(address1).burn(tokenId1);

      expect(
        await soulbound2FA.balanceOf(address1.address)
      ).to.be.equal(1);

      await soulbound2FA.connect(address1).burn(tokenId2);

      expect(
        await soulbound2FA.balanceOf(address1.address)
      ).to.be.equal(0);
    });
  });

  describe("tokenUri", () => {
    it("should get a valid token URI from its tokenId", async () => {
      const mintTx = await soulbound2FA
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signature
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
