import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments, network } from "hardhat";
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
const YEAR = 31536000; // 60 seconds * 60 minutes * 24 hours * 365 days

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
    [, owner, address1, address2] = await ethers.getSigners();
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

  describe("pause", () => {
    it("should pause from owner", async () => {
      await soulName.connect(owner).pause();

      expect(await soulName.paused()).to.be.true;
    });

    it("should unpause from owner", async () => {
      await soulName.connect(owner).pause();

      expect(await soulName.paused()).to.be.true;

      await soulName.connect(owner).unpause();

      expect(await soulName.paused()).to.be.false;
    });

    it("should fail to pause from non owner", async () => {
      await expect(soulName.connect(address1).pause()).to.be.rejected;
    });

    it("should fail to unpause from non owner", async () => {
      await soulName.connect(owner).pause();

      expect(await soulName.paused()).to.be.true;

      await expect(soulName.connect(address1).unpause()).to.be.rejected;
    });
  });

  describe("supportsInterface", () => {
    it("get data from supportsInterface()", async () => {
      expect(await soulName.supportsInterface("0x01ffc9a7")).to.be.true;
    });
  });

  describe("set soulboundIdentity", () => {
    it("should fail to set soulboundIdentity from non admin user", async () => {
      await expect(
        soulName.connect(address1).setSoulboundIdentity(address2.address)
      ).to.be.rejected;
    });

    it("should success to set soulboundIdentity from admin user", async () => {
      await soulName.connect(owner).setSoulboundIdentity(address2.address);

      expect(await soulName.soulboundIdentity()).to.be.equal(address2.address);
    });
  });

  describe("set extension", () => {
    it("should fail to set extension from non admin user", async () => {
      await expect(soulName.connect(address1).setExtension(".other")).to.be
        .rejected;
    });

    it("should success to set extension from admin user", async () => {
      await soulName.connect(owner).setExtension(".other");

      expect(await soulName.getExtension()).to.be.equal(".other");
    });
  });

  describe("mint", () => {
    it("should mint from owner", async () => {
      const mintTx = await soulName
        .connect(owner)
        .mint(address1.address, SOUL_NAME1, identityId1, YEAR);
      const mintReceipt = await mintTx.wait();

      const nameId = mintReceipt.events![0].args![2].toNumber();

      expect(await soulName.balanceOf(address1.address)).to.be.equal(1);
      expect(await soulName.ownerOf(nameId)).to.be.equal(address1.address);
    });

    it("should success to mint a name twice to the same idenity", async () => {
      await soulName
        .connect(owner)
        .mint(address1.address, SOUL_NAME1, identityId1, YEAR);

      await soulName
        .connect(owner)
        .mint(address1.address, SOUL_NAME2, identityId1, YEAR);
    });

    it("should fail to mint duplicated name", async () => {
      await soulName
        .connect(owner)
        .mint(address1.address, SOUL_NAME1, identityId1, YEAR);

      await expect(
        soulName
          .connect(owner)
          .mint(address1.address, SOUL_NAME1, identityId1, YEAR)
      ).to.be.rejected;
    });

    it("should fail to mint from non-owner address", async () => {
      await expect(
        soulName
          .connect(address1)
          .mint(address1.address, SOUL_NAME1, identityId1, YEAR)
      ).to.be.rejected;
    });
  });

  describe("read data from the SoulName smart contract", () => {
    let nameId: number;

    beforeEach(async () => {
      const mintTx = await soulName
        .connect(owner)
        .mint(address1.address, SOUL_NAME1, identityId1, YEAR);
      const mintReceipt = await mintTx.wait();

      nameId = mintReceipt.events![0].args![2].toNumber();
    });

    it("isAvailable true with an existing name", async () => {
      await expect(await soulName.isAvailable(SOUL_NAME1)).to.be.equals(true);
    });

    it("isAvailable true with an existing name - case insensitive", async () => {
      await expect(
        await soulName.isAvailable(SOUL_NAME1.toLowerCase())
      ).to.be.equals(true);
      await expect(
        await soulName.isAvailable(SOUL_NAME1.toUpperCase())
      ).to.be.equals(true);
    });

    it("isAvailable false with a non existing name", async () => {
      await expect(await soulName.isAvailable("fakeName")).to.be.equals(false);
    });

    it("getTokenData with an existing name", async () => {
      const [sbtName, identityId] = await soulName.getTokenData(SOUL_NAME1);
      const extension = await soulName.getExtension();

      await expect(sbtName).to.be.equals(SOUL_NAME1 + extension);
      await expect(identityId).to.be.equals(identityId1);
    });

    it("getTokenData with an existing name - case insensitive", async () => {
      let [sbtName, identityId] = await soulName.getTokenData(
        SOUL_NAME1.toLowerCase()
      );
      const extension = await soulName.getExtension();

      await expect(sbtName).to.be.equals(SOUL_NAME1 + extension);
      await expect(identityId).to.be.equals(identityId1);

      [sbtName, identityId] = await soulName.getTokenData(
        SOUL_NAME1.toUpperCase()
      );

      await expect(sbtName).to.be.equals(SOUL_NAME1 + extension);
      await expect(identityId).to.be.equals(identityId1);
    });

    it("getTokenData with a non existing name", async () => {
      await expect(soulName.getTokenData("fakeName")).to.be.rejectedWith(
        "NAME_NOT_FOUND"
      );
    });

    it("getSoulNames(uint256) returns array of SBT names in lower case", async () => {
      expect(
        await soulName["getSoulNames(uint256)"](identityId1)
      ).to.deep.equal([SOUL_NAME1.toLowerCase()]);
    });

    it("getSoulNames(address) returns array of SBT names in lower case", async () => {
      expect(
        await soulName["getSoulNames(address)"](address1.address)
      ).to.deep.equal([SOUL_NAME1.toLowerCase()]);
    });

    it("should get a valid token URI", async () => {
      const tokenUri = await soulName.tokenURI(nameId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/name/");
    });
  });

  describe("transfer", () => {
    let nameId: number;

    beforeEach(async () => {
      const mintTx = await soulName
        .connect(owner)
        .mint(address1.address, SOUL_NAME1, identityId1, YEAR);
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

      const [, identityId] = await soulName.getTokenData(SOUL_NAME1);

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

      const [, identityId] = await soulName.getTokenData(SOUL_NAME1);

      await expect(identityId).to.be.equals(identityId2);
    });
  });

  describe("burn", () => {
    let nameId: number;

    beforeEach(async () => {
      const mintTx = await soulName
        .connect(owner)
        .mint(address1.address, SOUL_NAME1, identityId1, YEAR);
      const mintReceipt = await mintTx.wait();

      nameId = mintReceipt.events![0].args![2].toNumber();
    });

    it("should burn", async () => {
      await soulName.connect(address1).burn(nameId);

      await expect(await soulName.isAvailable(SOUL_NAME1)).to.be.equals(false);
      await expect(soulName.getTokenData("soulNameTest1")).to.be.rejectedWith(
        "NAME_NOT_FOUND"
      );
      await expect(await soulName["getSoulNames(uint256)"](identityId1)).to.be
        .empty;
    });
  });

  describe("expiration data", async () => {
    let nameId: number;

    beforeEach(async () => {
      const mintTx = await soulName
        .connect(owner)
        .mint(address1.address, SOUL_NAME1, identityId1, YEAR);
      const mintReceipt = await mintTx.wait();

      nameId = mintReceipt.events![0].args![2].toNumber();
    });

    it("should return an active registration period", async () => {
      const [, , expirationDate, active] = await soulName.getTokenData(
        SOUL_NAME1
      );

      expect(expirationDate).to.be.above(YEAR);
      expect(active).to.be.true;
      expect(
        await soulName["getSoulNames(uint256)"](identityId1)
      ).to.deep.equal([SOUL_NAME1.toLowerCase()]);
    });

    it("should return an inactive registration period", async () => {
      // increase time to expire the registration period
      await network.provider.send("evm_increaseTime", [YEAR + 1]);
      await network.provider.send("evm_mine");

      const [, , expirationDate, active] = await soulName.getTokenData(
        SOUL_NAME1
      );

      expect(expirationDate).to.be.above(YEAR);
      expect(active).to.be.false;
      expect(
        await soulName["getSoulNames(uint256)"](identityId1)
      ).to.deep.equal([]);
    });

    it("should renew period when period hasn't expired", async () => {
      // increase time to half the registration period
      await network.provider.send("evm_increaseTime", [YEAR / 2]);
      await network.provider.send("evm_mine");

      const [, , expirationDateStart] = await soulName.getTokenData(SOUL_NAME1);

      await soulName.connect(address1).renewPeriod(nameId, YEAR);

      const [, , expirationDateFinish, active] = await soulName.getTokenData(
        SOUL_NAME1
      );

      expect(
        expirationDateFinish.toNumber() - expirationDateStart.toNumber()
      ).to.be.equal(YEAR);
      expect(active).to.be.true;
      expect(
        await soulName["getSoulNames(uint256)"](identityId1)
      ).to.deep.equal([SOUL_NAME1.toLowerCase()]);
    });

    it("should renew period when period has expired", async () => {
      // increase time to expire the registration period
      await network.provider.send("evm_increaseTime", [YEAR + 1]);
      await network.provider.send("evm_mine");

      const [, , expirationDateStart] = await soulName.getTokenData(SOUL_NAME1);

      await soulName.connect(address1).renewPeriod(nameId, YEAR);

      const [, , expirationDateFinish, active] = await soulName.getTokenData(
        SOUL_NAME1
      );

      expect(
        expirationDateFinish.toNumber() - expirationDateStart.toNumber()
      ).to.be.above(YEAR);
      expect(active).to.be.true;
      expect(
        await soulName["getSoulNames(uint256)"](identityId1)
      ).to.deep.equal([SOUL_NAME1.toLowerCase()]);
    });

    it("should allow mint same name if previous has expired", async () => {
      // increase time to expire the registration period
      await network.provider.send("evm_increaseTime", [YEAR + 1]);
      await network.provider.send("evm_mine");

      // once expired, another user mints the same soul name
      await soulName
        .connect(owner)
        .mint(address2.address, SOUL_NAME1, identityId2, YEAR);
    });

    it("shouldn't renew period when period has expired and somebody has minted same name", async () => {
      // increase time to expire the registration period
      await network.provider.send("evm_increaseTime", [YEAR + 1]);
      await network.provider.send("evm_mine");

      // once expired, another user mints the same soul name
      await soulName
        .connect(owner)
        .mint(address2.address, SOUL_NAME1, identityId2, YEAR);

      // the first owner of the soul name tries to renew the period and fails
      await expect(
        soulName.connect(address1).renewPeriod(nameId, YEAR)
      ).to.be.rejectedWith("CAN_NOT_RENEW");
    });
  });
});
