import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  SoulBoundIdentity,
  SoulBoundIdentity__factory,
  SoulBoundName,
  SoulBoundName__factory
} from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

const SOULBOUND_NAME_ADDRESS1 = "soulBoundNameTest1";
const SOULBOUND_NAME_ADDRESS2 = "soulBoundNameTest2";

// contract instances
let soulBoundIdentity: SoulBoundIdentity;
let soulBoundName: SoulBoundName;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

let identityId1: number;
let identityId2: number;

describe("Soulbound Name", () => {
  before(async () => {
    [, owner, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulBoundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulBoundName", { fallbackToGlobal: false });

    const { address: soulBoundIdentityAddress } = await deployments.get(
      "SoulBoundIdentity"
    );
    const { address: soulBoundNameAddress } = await deployments.get(
      "SoulBoundName"
    );

    soulBoundIdentity = SoulBoundIdentity__factory.connect(
      soulBoundIdentityAddress,
      owner
    );
    soulBoundName = SoulBoundName__factory.connect(soulBoundNameAddress, owner);

    // we mint identity SBT for address1
    let mintTx = await soulBoundIdentity.connect(owner).mint(address1.address);
    let mintReceipt = await mintTx.wait();

    identityId1 = mintReceipt.events![0].args![2].toNumber();

    mintTx = await soulBoundIdentity.connect(owner).mint(address2.address);
    mintReceipt = await mintTx.wait();

    identityId2 = mintReceipt.events![0].args![2].toNumber();
  });

  describe("mint", () => {
    it("should mint from owner", async () => {
      const mintTx = await soulBoundName
        .connect(owner)
        .mint(address1.address, SOULBOUND_NAME_ADDRESS1, identityId1);
      const mintReceipt = await mintTx.wait();

      const nameId = mintReceipt.events![0].args![2].toNumber();

      expect(await soulBoundName.balanceOf(address1.address)).to.be.equal(1);
      expect(await soulBoundName.ownerOf(nameId)).to.be.equal(address1.address);
    });

    it("should success to mint a name twice to the same idenity", async () => {
      await soulBoundName
        .connect(owner)
        .mint(address1.address, SOULBOUND_NAME_ADDRESS1, identityId1);

      await soulBoundName
        .connect(owner)
        .mint(address1.address, SOULBOUND_NAME_ADDRESS2, identityId1);
    });

    it("should fail to mint duplicated name", async () => {
      await soulBoundName
        .connect(owner)
        .mint(address1.address, SOULBOUND_NAME_ADDRESS1, identityId1);

      await expect(
        soulBoundName
          .connect(owner)
          .mint(address1.address, SOULBOUND_NAME_ADDRESS1, identityId1)
      ).to.be.rejected;
    });

    it("should fail to mint from address1", async () => {
      await expect(
        soulBoundName
          .connect(address1)
          .mint(address1.address, SOULBOUND_NAME_ADDRESS1, identityId1)
      ).to.be.rejected;
    });
  });

  describe("read data from the SoulBoundName smart contract", () => {
    let nameId: number;

    beforeEach(async () => {
      const mintTx = await soulBoundName
        .connect(owner)
        .mint(address1.address, SOULBOUND_NAME_ADDRESS1, identityId1);
      const mintReceipt = await mintTx.wait();

      nameId = mintReceipt.events![0].args![2].toNumber();
    });

    it("nameExists true with an existing name", async () => {
      await expect(
        await soulBoundName.nameExists(SOULBOUND_NAME_ADDRESS1)
      ).to.be.equals(true);
    });

    it("nameExists true with an existing name - case insensitive", async () => {
      await expect(
        await soulBoundName.nameExists(SOULBOUND_NAME_ADDRESS1.toLowerCase())
      ).to.be.equals(true);
      await expect(
        await soulBoundName.nameExists(SOULBOUND_NAME_ADDRESS1.toUpperCase())
      ).to.be.equals(true);
    });

    it("nameExists false with a non existing name", async () => {
      await expect(await soulBoundName.nameExists("fakeName")).to.be.equals(
        false
      );
    });

    it("getIdentityData with an existing name", async () => {
      const [sbtName, identityId] = await soulBoundName.getIdentityData(
        SOULBOUND_NAME_ADDRESS1
      );
      const extension = await soulBoundName.extension();

      await expect(sbtName).to.be.equals(SOULBOUND_NAME_ADDRESS1+extension);
      await expect(identityId).to.be.equals(identityId1);
    });

    it("getIdentityData with an existing name - case insensitive", async () => {
      let [sbtName, identityId] = await soulBoundName.getIdentityData(
        SOULBOUND_NAME_ADDRESS1.toLowerCase()
      );
      const extension = await soulBoundName.extension();

      await expect(sbtName).to.be.equals(SOULBOUND_NAME_ADDRESS1+extension);
      await expect(identityId).to.be.equals(identityId1);

      [sbtName, identityId] = await soulBoundName.getIdentityData(
        SOULBOUND_NAME_ADDRESS1.toUpperCase()
      );

      await expect(sbtName).to.be.equals(SOULBOUND_NAME_ADDRESS1+extension);
      await expect(identityId).to.be.equals(identityId1);
    });

    it("getIdentityData with a non existing name", async () => {
      await expect(
        soulBoundName.getIdentityData("fakeName")
      ).to.be.rejectedWith("NAME_NOT_FOUND");
    });
  });

  describe("burn", () => {
    let nameId: number;

    beforeEach(async () => {
      const mintTx = await soulBoundName
        .connect(owner)
        .mint(address1.address, SOULBOUND_NAME_ADDRESS1, identityId1);
      const mintReceipt = await mintTx.wait();

      nameId = mintReceipt.events![0].args![2].toNumber();
    });

    it("should burn", async () => {
      await soulBoundName.connect(address1).burn(nameId);

      await expect(
        await soulBoundName.nameExists(SOULBOUND_NAME_ADDRESS1)
      ).to.be.equals(false);
      await expect(
        soulBoundName.getIdentityData("soulbOundNameTest1")
      ).to.be.rejectedWith("NAME_NOT_FOUND");
      await expect(await soulBoundName.getIdentityNames(identityId1)).to.be
        .empty;
    });
  });
});
