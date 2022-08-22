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
    let mintTx = await soulBoundIdentity
      .connect(owner)
      .mint(address1.address);
    let mintReceipt = await mintTx.wait();

    identityId1 = mintReceipt.events![0].args![2].toNumber();

    mintTx = await soulBoundIdentity
      .connect(owner)
      .mint(address2.address);
    mintReceipt = await mintTx.wait();

    identityId2 = mintReceipt.events![0].args![2].toNumber();
  });

  describe("mint", () => {
    it("should mint from owner", async () => {
      await soulBoundName
        .connect(owner)
        .mint(address1.address, "soulBoundNameTest", identityId1);
    });

    it("should success to mint twice", async () => {
      await soulBoundName
        .connect(owner)
        .mint(address1.address, "soulBoundNameTest1", identityId1);

      await soulBoundName
        .connect(owner)
        .mint(address1.address, "soulBoundNameTest2", identityId1);
    });

    it("should fail to mint duplicated name", async () => {
      await soulBoundName
        .connect(owner)
        .mint(address1.address, "soulBoundNameTest", identityId1);

      await expect(
        soulBoundName
          .connect(owner)
          .mint(address1.address, "soulBoundNameTest", identityId1)
      ).to.be.rejected;
    });

    it("should fail to mint from address1", async () => {
      await expect(
        soulBoundName
          .connect(address1)
          .mint(address1.address, "soulBoundNameTest", identityId1)
      ).to.be.rejected;
    });
  });
});
