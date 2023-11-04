import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments, getChainId } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  ReferenceSBTDynamicSelfSovereign,
  ReferenceSBTDynamicSelfSovereign__factory,
  SoulboundIdentity,
  SoulboundIdentity__factory
} from "../typechain";
import { getEnvParams } from "../src/EnvParams";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulboundIdentity: SoulboundIdentity;
let sbtDynamic: ReferenceSBTDynamicSelfSovereign;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;
let authority: SignerWithAddress;

let identityId1: number;

const signatureDate = Math.floor(Date.now() / 1000);

let signatureToAddress: string;

const signMintSBTToAddress = async (
  to: string,
  authoritySigner: SignerWithAddress
) => {
  const chainId = await getChainId();

  const signature = await authoritySigner._signTypedData(
    // Domain
    {
      name: "ReferenceSBTSelfSovereign",
      version: "1.0.0",
      chainId: chainId,
      verifyingContract: sbtDynamic.address
    },
    // Types
    {
      Mint: [
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

describe("ReferenceSBTDynamicSelfSovereign", () => {
  before(async () => {
    [, owner, address1, address2, authority] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: true });

    const { address: soulboundIdentityAddress } =
      await deployments.get("SoulboundIdentity");

    const env = getEnvParams("hardhat");
    const baseUri = `${env.BASE_URI}/green/hardhat/`;

    const SBTDynamic = await ethers.getContractFactory(
      "ReferenceSBTDynamicSelfSovereign"
    );
    const sbtDynamicDeploy = await SBTDynamic.deploy(
      env.ADMIN || owner.address,
      env.SOULBOUNDGREEN_NAME,
      env.SOULBOUNDGREEN_SYMBOL,
      baseUri,
      soulboundIdentityAddress,
      [
        env.SWAP_ROUTER,
        env.WETH_TOKEN,
        env.USDC_TOKEN,
        env.MASA_TOKEN,
        env.PROJECTFEE_RECEIVER || owner.address,
        env.PROTOCOLFEE_RECEIVER || ethers.constants.AddressZero,
        env.PROTOCOLFEE_AMOUNT || 0,
        env.PROTOCOLFEE_PERCENT || 0,
        env.PROTOCOLFEE_PERCENT_SUB || 0
      ],
      1
    );
    await sbtDynamicDeploy.deployed();

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );

    sbtDynamic = ReferenceSBTDynamicSelfSovereign__factory.connect(
      sbtDynamicDeploy.address,
      owner
    );

    // we mint identity SBT
    const mintTx = await soulboundIdentity
      .connect(owner)
      ["mint(address)"](address1.address);
    const mintReceipt = await mintTx.wait();

    identityId1 = mintReceipt.events![0].args![1].toNumber();

    // we add authority account
    await sbtDynamic.addAuthority(authority.address);

    signatureToAddress = await signMintSBTToAddress(
      address1.address,
      authority
    );
  });

  describe("owner functions", () => {
    it("should set SoulboundIdentity from owner", async () => {
      await sbtDynamic.connect(owner).setSoulboundIdentity(address1.address);

      expect(await sbtDynamic.soulboundIdentity()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set SoulboundIdentity from non owner", async () => {
      await expect(
        sbtDynamic.connect(address1).setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });

    it("should add state from owner", async () => {
      await sbtDynamic.connect(owner).addBeforeMintState("discord");
      await sbtDynamic.connect(owner).addBeforeMintState("twitter");

      expect(await sbtDynamic.getBeforeMintStates()).to.deep.equal([
        "discord",
        "twitter"
      ]);

      await sbtDynamic.connect(owner).addAfterMintState("discord");

      expect(await sbtDynamic.getAfterMintStates()).to.deep.equal(["discord"]);
    });

    it("should fail to add state from non owner", async () => {
      await expect(sbtDynamic.connect(address1).addBeforeMintState("discord"))
        .to.be.rejected;
      await expect(sbtDynamic.connect(address1).addAfterMintState("discord")).to
        .be.rejected;
    });
  });

  describe("sbt information", () => {
    it("should be able to get sbt information", async () => {
      expect(await sbtDynamic.name()).to.equal("Masa Green");

      expect(await sbtDynamic.symbol()).to.equal("MG-2FA");
    });
  });

  describe("mint", () => {
    it("should fail to mint from owner address", async () => {
      await expect(
        sbtDynamic
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

    it("can't mint twice", async () => {
      await sbtDynamic
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );
      await expect(
        sbtDynamic
          .connect(address1)
          ["mint(address,address,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            address1.address,
            authority.address,
            signatureDate,
            signatureToAddress
          )
      ).to.be.reverted;

      expect(await sbtDynamic.balanceOf(address1.address)).to.equal(1);
    });

    it("should mint from final user address", async () => {
      const mintTx = await sbtDynamic
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
  });

  describe("burn", () => {
    it("should burn", async () => {
      // we mint
      let mintTx = await sbtDynamic
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

      expect(await sbtDynamic.balanceOf(address1.address)).to.be.equal(1);
      expect(await sbtDynamic["ownerOf(uint256)"](tokenId1)).to.be.equal(
        address1.address
      );

      await sbtDynamic.connect(address1).burn(tokenId1);

      expect(await sbtDynamic.balanceOf(address1.address)).to.be.equal(0);
    });
  });

  describe("tokenUri", () => {
    it("should get a valid token URI from its tokenId", async () => {
      const mintTx = await sbtDynamic
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
      const tokenUri = await sbtDynamic.tokenURI(tokenId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/green/");
    });
  });

  describe("beforeMintStates", () => {
    beforeEach(async () => {
      await sbtDynamic.connect(owner).addBeforeMintState("discord");
      await sbtDynamic.connect(owner).addBeforeMintState("twitter");
    });

    it("should not mint if not all before mint states are set", async () => {
      await expect(
        sbtDynamic
          .connect(address1)
          ["mint(address,address,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            address1.address,
            authority.address,
            signatureDate,
            signatureToAddress
          )
      ).to.be.rejected;
    });
  });
});
