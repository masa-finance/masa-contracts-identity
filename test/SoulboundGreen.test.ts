import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments, getChainId } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  SoulboundGreen,
  SoulboundGreen__factory,
  SoulboundIdentity,
  SoulboundIdentity__factory
} from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulboundIdentity: SoulboundIdentity;
let soulboundGreen: SoulboundGreen;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;
let authority: SignerWithAddress;

let identityId1: number;

const signatureDate = Math.floor(Date.now() / 1000);

let signatureToIdentity: string;
let signatureToAddress: string;

const signMintCreditGreenToIdentity = async (
  identityId: number,
  authoritySigner: SignerWithAddress
) => {
  const chainId = await getChainId();

  const signature = await authoritySigner._signTypedData(
    // Domain
    {
      name: "SoulboundGreen",
      version: "1.0.0",
      chainId: chainId,
      verifyingContract: soulboundGreen.address
    },
    // Types
    {
      MintGreen: [
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

const signMintCreditGreenToAddress = async (
  to: string,
  authoritySigner: SignerWithAddress
) => {
  const chainId = await getChainId();

  const signature = await authoritySigner._signTypedData(
    // Domain
    {
      name: "SoulboundGreen",
      version: "1.0.0",
      chainId: chainId,
      verifyingContract: soulboundGreen.address
    },
    // Types
    {
      MintGreen: [
        { name: "to", type: "address" },
        { name: "authorityAddress", type: "address" },
        { name: "signatureDate", type: "uint256" }
      ]
    },
    // Value
    {
      to: to,
      authorityAddress: authoritySigner.address,
      signatureDate: signatureDate
    }
  );

  return signature;
};

describe("Soulbound Two-factor authentication (Green)", () => {
  before(async () => {
    [, owner, address1, address2, authority] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: true });
    await deployments.fixture("SoulboundGreen", {
      fallbackToGlobal: true
    });

    const { address: soulboundIdentityAddress } = await deployments.get(
      "SoulboundIdentity"
    );
    const { address: soulboundGreenAddress } = await deployments.get(
      "SoulboundGreen"
    );

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );
    soulboundGreen = SoulboundGreen__factory.connect(
      soulboundGreenAddress,
      owner
    );

    // we mint identity SBT
    const mintTx = await soulboundIdentity
      .connect(owner)
      .mint(address1.address);
    const mintReceipt = await mintTx.wait();

    identityId1 = mintReceipt.events![0].args![1].toNumber();

    // we add authority account
    await soulboundGreen.addAuthority(authority.address);

    await soulboundGreen.setMintPrice(0); // 0 USDC

    signatureToIdentity = await signMintCreditGreenToIdentity(
      identityId1,
      authority
    );
    signatureToAddress = await signMintCreditGreenToAddress(
      address1.address,
      authority
    );
  });

  describe("owner functions", () => {
    it("should set SoulboundIdentity from owner", async () => {
      await soulboundGreen
        .connect(owner)
        .setSoulboundIdentity(address1.address);

      expect(await soulboundGreen.soulboundIdentity()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set SoulboundIdentity from non owner", async () => {
      await expect(
        soulboundGreen.connect(address1).setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });
  });

  describe("sbt information", () => {
    it("should be able to get sbt information", async () => {
      expect(await soulboundGreen.name()).to.equal("Masa Green");

      expect(await soulboundGreen.symbol()).to.equal("MG-2FA");
    });
  });

  describe("mint", () => {
    it("should fail to mint from owner address", async () => {
      await expect(
        soulboundGreen
          .connect(owner)
          ["mint(address,address,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            address1.address,
            authority.address,
            signatureDate,
            signatureToAddress
          )
      ).to.be.revertedWith("CallerNotOwner");
    });

    it("should fail to mint from owner identity", async () => {
      await expect(
        soulboundGreen
          .connect(owner)
          ["mint(address,uint256,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            identityId1,
            authority.address,
            signatureDate,
            signatureToIdentity
          )
      ).to.be.revertedWith("CallerNotOwner");
    });

    it("should mint twice", async () => {
      await soulboundGreen
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );
      await soulboundGreen
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );

      expect(await soulboundGreen.totalSupply()).to.equal(2);
      expect(await soulboundGreen.tokenByIndex(0)).to.equal(0);
      expect(await soulboundGreen.tokenByIndex(1)).to.equal(1);
    });

    it("should mint from final user address", async () => {
      const mintTx = await soulboundGreen
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );
      const mintReceipt = await mintTx.wait();

      const toAddress = mintReceipt.events![1].args![1];

      expect(toAddress).to.equal(address1.address);
    });

    it("should mint from final user identity", async () => {
      const mintTx = await soulboundGreen
        .connect(address1)
        ["mint(address,uint256,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          identityId1,
          authority.address,
          signatureDate,
          signatureToIdentity
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulboundGreen.getIdentityId(tokenId)).to.equal(identityId1);
    });

    it("should mint to an address, with a Green SBT not linked to an identity SC", async () => {
      // we set the identity SC to 0x0
      await soulboundGreen.setSoulboundIdentity(ethers.constants.AddressZero);

      const signatureToAddress2 = await signMintCreditGreenToAddress(
        address2.address,
        authority
      );
      const mintTx = await soulboundGreen
        .connect(address2)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address2.address,
          authority.address,
          signatureDate,
          signatureToAddress2
        );
      const mintReceipt = await mintTx.wait();

      const toAddress = mintReceipt.events![1].args![1];

      expect(toAddress).to.equal(address2.address);

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      // check that this Green is not linked to an identity
      await expect(soulboundGreen.getIdentityId(tokenId)).to.be.revertedWith(
        "NotLinkedToAnIdentitySBT"
      );
    });
  });

  describe("burn", () => {
    it("should burn", async () => {
      // we mint
      let mintTx = await soulboundGreen
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );
      let mintReceipt = await mintTx.wait();
      const tokenId1 = mintReceipt.events![0].args![1].toNumber();

      // we mint again
      mintTx = await soulboundGreen
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );
      mintReceipt = await mintTx.wait();
      const tokenId2 = mintReceipt.events![0].args![1].toNumber();

      expect(await soulboundGreen.balanceOf(address1.address)).to.be.equal(2);
      expect(await soulboundGreen.balanceOf(address1.address)).to.be.equal(2);
      expect(await soulboundGreen["ownerOf(uint256)"](tokenId1)).to.be.equal(
        address1.address
      );
      expect(await soulboundGreen["ownerOf(uint256)"](tokenId2)).to.be.equal(
        address1.address
      );

      await soulboundGreen.connect(address1).burn(tokenId1);

      expect(await soulboundGreen.balanceOf(address1.address)).to.be.equal(1);

      await soulboundGreen.connect(address1).burn(tokenId2);

      expect(await soulboundGreen.balanceOf(address1.address)).to.be.equal(0);
    });
  });

  describe("tokenUri", () => {
    it("should get a valid token URI from its tokenId", async () => {
      const mintTx = await soulboundGreen
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );

      const mintReceipt = await mintTx.wait();
      const tokenId = mintReceipt.events![0].args![1].toNumber();
      const tokenUri = await soulboundGreen.tokenURI(tokenId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/green/");
    });
  });
});
