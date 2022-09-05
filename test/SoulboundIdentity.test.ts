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
let someone: SignerWithAddress;

const SOUL_NAME1 = "soulName1";
const SOUL_NAME2 = "soulName2";

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

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );
  });

  describe("mint", () => {
    it("should mint from owner", async () => {
      await soulboundIdentity.connect(owner).mint(someone.address);

      expect(await soulboundIdentity.balanceOf(someone.address)).to.be.equal(1);
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
        .mintIdentityWithName(address1.address, SOUL_NAME1);

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
          .mintIdentityWithName(address1.address, SOUL_NAME1)
      ).to.be.rejected;
    });

    it("should fail to mint twice", async () => {
      await soulboundIdentity
        .connect(owner)
        .mintIdentityWithName(address1.address, SOUL_NAME1);
      await expect(
        soulboundIdentity
          .connect(owner)
          .mintIdentityWithName(address1.address, SOUL_NAME2)
      ).to.be.rejectedWith("Soulbound identity already created!");
    });

    it("should fail to mint duplicated name", async () => {
      await soulboundIdentity
        .connect(owner)
        .mintIdentityWithName(address1.address, SOUL_NAME1);
      await expect(
        soulboundIdentity
          .connect(owner)
          .mintIdentityWithName(address2.address, SOUL_NAME1)
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
      ).to.be.rejectedWith("SBT_TRANSFER_NOT_PERMITTED");

      await expect(
        soulboundIdentity
          .connect(someone)
          ["safeTransferFrom(address,address,uint256)"](
            someone.address,
            someone.address,
            1
          )
      ).to.be.rejectedWith("SBT_TRANSFER_NOT_PERMITTED");

      await expect(
        soulboundIdentity
          .connect(someone)
          ["safeTransferFrom(address,address,uint256,bytes)"](
            someone.address,
            someone.address,
            1,
            []
          )
      ).to.be.rejectedWith("SBT_TRANSFER_NOT_PERMITTED");
    });
  });

  describe("tokenURI", () => {
    let tokenId;

    beforeEach(async () => {
      const mintTx = await soulboundIdentity
        .connect(owner)
        .mintIdentityWithName(someone.address, SOUL_NAME1);

      const mintReceipt = await mintTx.wait();
      tokenId = mintReceipt.events![0].args![2].toNumber();
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
        .mintIdentityWithName(address1.address, SOUL_NAME1);
      const mintReceipt = await mintTx.wait();

      identityId = mintReceipt.events![0].args![2].toNumber();
    });

    it("nameExists true with an existing name", async () => {
      await expect(await soulboundIdentity.nameExists(SOUL_NAME1)).to.be.equals(
        true
      );
    });

    it("nameExists true with an existing name - case insensitive", async () => {
      await expect(
        await soulboundIdentity.nameExists(SOUL_NAME1.toLowerCase())
      ).to.be.equals(true);
      await expect(
        await soulboundIdentity.nameExists(SOUL_NAME1.toUpperCase())
      ).to.be.equals(true);
    });

    it("nameExists false with a non existing name", async () => {
      await expect(await soulboundIdentity.nameExists("fakeName")).to.be.equals(
        false
      );
    });

    it("getIdentityData with an existing name", async () => {
      const [sbtName, identityId] = await soulboundIdentity.getIdentityData(
        SOUL_NAME1
      );
      const extension = await soulboundIdentity.extension();

      await expect(sbtName).to.be.equals(SOUL_NAME1 + extension);
    });

    it("getIdentityData with an existing name - case insensitive", async () => {
      let [sbtName, identityId] = await soulboundIdentity.getIdentityData(
        SOUL_NAME1.toLowerCase()
      );
      const extension = await soulboundIdentity.extension();

      await expect(sbtName).to.be.equals(SOUL_NAME1 + extension);

      [sbtName, identityId] = await soulboundIdentity.getIdentityData(
        SOUL_NAME1.toUpperCase()
      );

      await expect(sbtName).to.be.equals(SOUL_NAME1 + extension);
    });

    it("getIdentityData with a non existing name", async () => {
      await expect(
        soulboundIdentity.getIdentityData("fakeName")
      ).to.be.rejectedWith("NAME_NOT_FOUND");
    });

    it("getIdentityNames(uint256) returns array of SBT names in lower case", async () => {
      expect(
        await soulboundIdentity["getIdentityNames(uint256)"](identityId)
      ).to.deep.equal([SOUL_NAME1.toLowerCase()]);
    });

    it("getIdentityNames(address) returns array of SBT names in lower case", async () => {
      expect(
        await soulboundIdentity["getIdentityNames(address)"](address1.address)
      ).to.deep.equal([SOUL_NAME1.toLowerCase()]);
    });
  });
});
