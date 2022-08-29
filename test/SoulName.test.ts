import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  SoulboundIdentity,
  SoulboundIdentity__factory,
  SoulName,
  SoulName__factory
} from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

const SOUL_NAME1 = "soulNameTest1";
const SOUL_NAME2 = "soulNameTest2";

// contract instances
let soulboundIdentity: SoulboundIdentity;
let soulName: SoulName;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

let identityId1: number;
let identityId2: number;

describe("Soul Name", () => {
  before(async () => {
    [owner, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulName", { fallbackToGlobal: false });

    const { address: soulboundIdentityAddress } = await deployments.get(
      "SoulboundIdentity"
    );
    const { address: soulNameAddress } = await deployments.get("SoulName");

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );
    soulName = SoulName__factory.connect(soulNameAddress, owner);

    // we mint identity SBT for address1
    let mintTx = await soulboundIdentity.connect(owner).mint(address1.address);
    let mintReceipt = await mintTx.wait();

    identityId1 = mintReceipt.events![0].args![2].toNumber();

    mintTx = await soulboundIdentity.connect(owner).mint(address2.address);
    mintReceipt = await mintTx.wait();

    identityId2 = mintReceipt.events![0].args![2].toNumber();
  });

  describe("mint", () => {
    it("should mint from owner", async () => {
      const mintTx = await soulName
        .connect(owner)
        .mint(address1.address, SOUL_NAME1, identityId1);
      const mintReceipt = await mintTx.wait();

      const nameId = mintReceipt.events![0].args![2].toNumber();

      expect(await soulName.balanceOf(address1.address)).to.be.equal(1);
      expect(await soulName.ownerOf(nameId)).to.be.equal(address1.address);
    });

    it("should success to mint a name twice to the same idenity", async () => {
      await soulName
        .connect(owner)
        .mint(address1.address, SOUL_NAME1, identityId1);

      await soulName
        .connect(owner)
        .mint(address1.address, SOUL_NAME2, identityId1);
    });

    it("should fail to mint duplicated name", async () => {
      await soulName
        .connect(owner)
        .mint(address1.address, SOUL_NAME1, identityId1);

      await expect(
        soulName.connect(owner).mint(address1.address, SOUL_NAME1, identityId1)
      ).to.be.rejected;
    });

    it("should fail to mint from non-owner address", async () => {
      await expect(
        soulName
          .connect(address1)
          .mint(address1.address, SOUL_NAME1, identityId1)
      ).to.be.rejected;
    });
  });

  describe("read data from the SoulName smart contract", () => {
    let nameId: number;

    beforeEach(async () => {
      const mintTx = await soulName
        .connect(owner)
        .mint(address1.address, SOUL_NAME1, identityId1);
      const mintReceipt = await mintTx.wait();

      nameId = mintReceipt.events![0].args![2].toNumber();
    });

    it("nameExists true with an existing name", async () => {
      await expect(await soulName.nameExists(SOUL_NAME1)).to.be.equals(true);
    });

    it("nameExists true with an existing name - case insensitive", async () => {
      await expect(
        await soulName.nameExists(SOUL_NAME1.toLowerCase())
      ).to.be.equals(true);
      await expect(
        await soulName.nameExists(SOUL_NAME1.toUpperCase())
      ).to.be.equals(true);
    });

    it("nameExists false with a non existing name", async () => {
      await expect(await soulName.nameExists("fakeName")).to.be.equals(false);
    });

    it("getIdentityData with an existing name", async () => {
      const [sbtName, identityId] = await soulName.getIdentityData(SOUL_NAME1);
      const extension = await soulName.extension();

      await expect(sbtName).to.be.equals(SOUL_NAME1 + extension);
      await expect(identityId).to.be.equals(identityId1);
    });

    it("getIdentityData with an existing name - case insensitive", async () => {
      let [sbtName, identityId] = await soulName.getIdentityData(
        SOUL_NAME1.toLowerCase()
      );
      const extension = await soulName.extension();

      await expect(sbtName).to.be.equals(SOUL_NAME1 + extension);
      await expect(identityId).to.be.equals(identityId1);

      [sbtName, identityId] = await soulName.getIdentityData(
        SOUL_NAME1.toUpperCase()
      );

      await expect(sbtName).to.be.equals(SOUL_NAME1 + extension);
      await expect(identityId).to.be.equals(identityId1);
    });

    it("getIdentityData with a non existing name", async () => {
      await expect(soulName.getIdentityData("fakeName")).to.be.rejectedWith(
        "NAME_NOT_FOUND"
      );
    });

    it("getIdentityNames returns array of SBT names in lower case", async () => {
      expect(await soulName.getIdentityNames(identityId1)).to.deep.equal([
        SOUL_NAME1.toLowerCase()
      ]);
    });

    it("should get a valid token URI", async () => {
      const tokenUri = await soulName.tokenURI(nameId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("data:application/json");
    });
  });

  describe("transfer", () => {
    let nameId: number;

    beforeEach(async () => {
      const mintTx = await soulName
        .connect(owner)
        .mint(address1.address, SOUL_NAME1, identityId1);
      const mintReceipt = await mintTx.wait();

      nameId = mintReceipt.events![0].args![2].toNumber();
    });

    it("should transfer", async () => {
      await soulName
        .connect(address1)
        .transferFrom(address1.address, address2.address, nameId);

      expect(await soulboundIdentity.balanceOf(address1.address)).to.be.equal(
        1
      );
      expect(await soulboundIdentity.balanceOf(address2.address)).to.be.equal(
        1
      );
      expect(await soulName.balanceOf(address1.address)).to.be.equal(0);
      expect(await soulName.balanceOf(address2.address)).to.be.equal(1);

      const [, identityId] = await soulName.getIdentityData(SOUL_NAME1);

      await expect(identityId).to.be.equals(identityId1);
    });

    it("should update identity Id", async () => {
      await soulName
        .connect(address1)
        .transferFrom(address1.address, address2.address, nameId);

      await soulName.connect(address2).updateIdentityId(nameId, identityId2);

      expect(await soulboundIdentity.balanceOf(address1.address)).to.be.equal(
        1
      );
      expect(await soulboundIdentity.balanceOf(address2.address)).to.be.equal(
        1
      );
      expect(await soulName.balanceOf(address1.address)).to.be.equal(0);
      expect(await soulName.balanceOf(address2.address)).to.be.equal(1);

      const [, identityId] = await soulName.getIdentityData(SOUL_NAME1);

      await expect(identityId).to.be.equals(identityId2);
    });
  });

  describe("burn", () => {
    let nameId: number;

    beforeEach(async () => {
      const mintTx = await soulName
        .connect(owner)
        .mint(address1.address, SOUL_NAME1, identityId1);
      const mintReceipt = await mintTx.wait();

      nameId = mintReceipt.events![0].args![2].toNumber();
    });

    it("should burn", async () => {
      await soulName.connect(address1).burn(nameId);

      await expect(await soulName.nameExists(SOUL_NAME1)).to.be.equals(false);
      await expect(
        soulName.getIdentityData("soulNameTest1")
      ).to.be.rejectedWith("NAME_NOT_FOUND");
      await expect(await soulName.getIdentityNames(identityId1)).to.be.empty;
    });
  });
});
