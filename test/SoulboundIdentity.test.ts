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

let owner: SignerWithAddress;
let protocolWallet: SignerWithAddress;
let someone: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

const SOUL_NAME1 = "soulName1";
const SOUL_NAME2 = "soulName2";
const YEAR = 1; // 1 year
const ARWEAVE_LINK = "ar://jK9sR4OrYvODj7PD3czIAyNJalub0-vdV_JAg1NqQ-o";

describe("Soulbound Identity", () => {
  before(async () => {
    [, owner, protocolWallet, someone, address1, address2] =
      await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulName", { fallbackToGlobal: false });

    const { address: soulboundIdentityAddress } = await deployments.get(
      "SoulboundIdentity"
    );

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );
  });

  describe("supportsInterface", () => {
    it("get data from supportsInterface()", async () => {
      expect(await soulboundIdentity.supportsInterface("0x01ffc9a7")).to.be
        .true;
    });
  });

  describe("set soulName", () => {
    it("should fail to set soulName from non owner user", async () => {
      await expect(
        soulboundIdentity.connect(address1).setSoulName(address2.address)
      ).to.be.rejected;
    });

    it("should success to set soulName from owner user", async () => {
      await soulboundIdentity.connect(owner).setSoulName(address2.address);

      expect(await soulboundIdentity.soulName()).to.be.equal(address2.address);
    });
  });

  describe("sbt information", () => {
    it("should be able to get sbt information", async () => {
      expect(await soulboundIdentity.name()).to.equal("Masa Identity");

      expect(await soulboundIdentity.symbol()).to.equal("MID");
    });
  });

  describe("mint", () => {
    it("should mint from owner", async () => {
      await soulboundIdentity.connect(owner)["mint(address)"](someone.address);

      expect(await soulboundIdentity.balanceOf(someone.address)).to.be.equal(1);
    });

    it("should fail to mint twice", async () => {
      await soulboundIdentity.connect(owner)["mint(address)"](someone.address);
      await expect(
        soulboundIdentity.connect(owner)["mint(address)"](someone.address)
      ).to.be.rejectedWith("Soulbound identity already created!");

      expect(await soulboundIdentity.totalSupply()).to.equal(1);
      expect(await soulboundIdentity.tokenByIndex(0)).to.equal(0);
    });

    it("should mint twice to different accounts", async () => {
      await soulboundIdentity.connect(owner)["mint(address)"](someone.address);
      await soulboundIdentity.connect(owner)["mint(address)"](address1.address);

      expect(await soulboundIdentity.totalSupply()).to.equal(2);
      expect(await soulboundIdentity.tokenByIndex(0)).to.equal(0);
      expect(await soulboundIdentity.tokenByIndex(1)).to.equal(1);
      expect(await soulboundIdentity.tokenOfOwner(someone.address)).to.equal(0);
      expect(await soulboundIdentity.tokenOfOwner(address1.address)).to.equal(
        1
      );
    });

    it("should fail to mint from someone", async () => {
      await expect(
        soulboundIdentity.connect(someone)["mint(address)"](someone.address)
      ).to.be.rejected;
    });
  });

  describe("mint paying a protocol fee", () => {
    beforeEach(async () => {
      await soulboundIdentity
        .connect(owner)
        .setProtocolFeeReceiver(protocolWallet.address);
      await soulboundIdentity.connect(owner).setProtocolFeeAmount(1_000_000); // 1 USD

      await soulboundIdentity
        .connect(owner)
        .enablePaymentMethod(ethers.constants.AddressZero);
    });

    it("should fail to mint from owner if he doesn't pay a fee", async () => {
      await expect(
        soulboundIdentity.connect(owner)["mint(address)"](someone.address)
      ).to.be.rejected;
    });

    it("should fail to mint from owner if we haven't set all payment parameters", async () => {
      await soulboundIdentity
        .connect(owner)
        .setSwapRouter(ethers.constants.AddressZero);

      await expect(
        soulboundIdentity.getMintPriceWithProtocolFee(
          ethers.constants.AddressZero
        )
      ).to.be.rejectedWith("PaymentParamsNotSet");

      await expect(
        soulboundIdentity
          .connect(owner)
          ["mint(address)"](someone.address, { value: 1_000_000 })
      ).to.be.rejectedWith("PaymentParamsNotSet");
    });

    it("should mint from owner if he pays a fee", async () => {
      const { price, protocolFee } =
        await soulboundIdentity.getMintPriceWithProtocolFee(
          ethers.constants.AddressZero
        );

      await soulboundIdentity
        .connect(owner)
        ["mint(address)"](someone.address, { value: price.add(protocolFee) });

      expect(await soulboundIdentity.balanceOf(someone.address)).to.be.equal(1);
    });
  });

  describe("mintIdentityWithName", () => {
    it("should mint from owner", async () => {
      await soulboundIdentity
        .connect(owner)
        ["mintIdentityWithName(address,string,uint256,string)"](
          address1.address,
          SOUL_NAME1,
          YEAR,
          ARWEAVE_LINK
        );

      expect(await soulboundIdentity.balanceOf(address1.address)).to.be.equal(
        1
      );
      expect(
        await soulboundIdentity["ownerOf(string)"](SOUL_NAME1)
      ).to.be.equal(address1.address);
    });

    it("should fail to mint from someone", async () => {
      await expect(
        soulboundIdentity
          .connect(address1)
          ["mintIdentityWithName(address,string,uint256,string)"](
            address1.address,
            SOUL_NAME1,
            YEAR,
            ARWEAVE_LINK
          )
      ).to.be.rejected;
    });

    it("should fail to mint twice", async () => {
      await soulboundIdentity
        .connect(owner)
        ["mintIdentityWithName(address,string,uint256,string)"](
          address1.address,
          SOUL_NAME1,
          YEAR,
          ARWEAVE_LINK
        );
      await expect(
        soulboundIdentity
          .connect(owner)
          ["mintIdentityWithName(address,string,uint256,string)"](
            address1.address,
            SOUL_NAME2,
            YEAR,
            ARWEAVE_LINK
          )
      ).to.be.rejectedWith("Soulbound identity already created!");
    });

    it("should fail to mint duplicated name", async () => {
      await soulboundIdentity
        .connect(owner)
        ["mintIdentityWithName(address,string,uint256,string)"](
          address1.address,
          SOUL_NAME1,
          YEAR,
          ARWEAVE_LINK
        );
      await expect(
        soulboundIdentity
          .connect(owner)
          ["mintIdentityWithName(address,string,uint256,string)"](
            address2.address,
            SOUL_NAME1,
            YEAR,
            ARWEAVE_LINK
          )
      ).to.be.rejectedWith("NameAlreadyExists");
    });
  });

  describe("burn", () => {
    it("should burn", async () => {
      const mintTx = await soulboundIdentity
        .connect(owner)
        ["mint(address)"](someone.address);
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulboundIdentity.balanceOf(someone.address)).to.be.equal(1);
      expect(await soulboundIdentity["ownerOf(uint256)"](tokenId)).to.be.equal(
        someone.address
      );
      expect(await soulboundIdentity.exists(tokenId)).to.be.true;

      await soulboundIdentity.connect(someone).burn(tokenId);

      expect(await soulboundIdentity.balanceOf(someone.address)).to.be.equal(0);
    });
  });

  describe("tokenURI", () => {
    let tokenId;

    beforeEach(async () => {
      const mintTx = await soulboundIdentity
        .connect(owner)
        ["mintIdentityWithName(address,string,uint256,string)"](
          someone.address,
          SOUL_NAME1,
          YEAR,
          ARWEAVE_LINK
        );

      const mintReceipt = await mintTx.wait();
      tokenId = mintReceipt.events![0].args![1].toNumber();
    });

    it("should get a valid token URI from its tokenId", async () => {
      const tokenUri = await soulboundIdentity["tokenURI(uint256)"](tokenId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/identity/");
    });

    it("should get a valid token URI from its name", async () => {
      const tokenUri = await soulboundIdentity["tokenURI(string)"](SOUL_NAME1);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/identity/");
    });

    it("should get a valid token URI from its address", async () => {
      const tokenUri = await soulboundIdentity["tokenURI(address)"](
        someone.address
      );

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/identity/");
    });
  });

  describe("read data from the smart contracts", () => {
    let identityId: number;

    beforeEach(async () => {
      const mintTx = await soulboundIdentity
        .connect(owner)
        ["mintIdentityWithName(address,string,uint256,string)"](
          address1.address,
          SOUL_NAME1,
          YEAR,
          ARWEAVE_LINK
        );
      const mintReceipt = await mintTx.wait();

      identityId = mintReceipt.events![0].args![1].toNumber();
    });

    it("isAvailable false with an existing name", async () => {
      await expect(await soulboundIdentity.isAvailable(SOUL_NAME1)).to.be.equal(
        false
      );
    });

    it("isAvailable false with an existing name - case insensitive", async () => {
      await expect(
        await soulboundIdentity.isAvailable(SOUL_NAME1.toLowerCase())
      ).to.be.equal(false);
      await expect(
        await soulboundIdentity.isAvailable(SOUL_NAME1.toUpperCase())
      ).to.be.equal(false);
    });

    it("isAvailable true with a non existing name", async () => {
      await expect(await soulboundIdentity.isAvailable("fakeName")).to.be.equal(
        true
      );
    });

    it("getTokenData with an existing name", async () => {
      const { sbtName } = await soulboundIdentity.getTokenData(SOUL_NAME1);
      const extension = await soulboundIdentity.getExtension();

      await expect(sbtName).to.be.equal(SOUL_NAME1 + extension);
    });

    it("getTokenData with an existing name - case insensitive", async () => {
      const { sbtName: sbtName1 } = await soulboundIdentity.getTokenData(
        SOUL_NAME1.toLowerCase()
      );
      const extension = await soulboundIdentity.getExtension();

      await expect(sbtName1).to.be.equal(SOUL_NAME1 + extension);

      const { sbtName: sbtName2 } = await soulboundIdentity.getTokenData(
        SOUL_NAME1.toUpperCase()
      );

      await expect(sbtName2).to.be.equal(SOUL_NAME1 + extension);
    });

    it("getTokenData with a non existing name", async () => {
      await expect(soulboundIdentity.getTokenData("fakeName")).to.be.rejected;
    });

    it("getSoulNames(uint256) returns array of SBT names in lower case", async () => {
      expect(
        await soulboundIdentity["getSoulNames(uint256)"](identityId)
      ).to.deep.equal([SOUL_NAME1.toLowerCase()]);
    });

    it("getSoulNames(address) returns array of SBT names in lower case", async () => {
      expect(
        await soulboundIdentity["getSoulNames(address)"](address1.address)
      ).to.deep.equal([SOUL_NAME1.toLowerCase()]);
    });
  });
});
