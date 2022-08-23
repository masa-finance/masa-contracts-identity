import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  SoulBoundIdentityRouter,
  SoulBoundIdentityRouter__factory
} from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

const SOULBOUND_NAME1 = "soulBoundNameTest1";
const SOULBOUND_NAME2 = "soulBoundNameTest2";

// contract instances
let soulBoundIdentityRouter: SoulBoundIdentityRouter;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

let identityId1: number;
let identityId2: number;

describe("Soulbound Identity Router", () => {
  before(async () => {
    [, owner, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulBoundIdentityRouter", {
      fallbackToGlobal: false
    });

    const { address: soulBoundIdentityRourterAddress } = await deployments.get(
      "SoulBoundIdentityRouter"
    );

    soulBoundIdentityRouter = SoulBoundIdentityRouter__factory.connect(
      soulBoundIdentityRourterAddress,
      owner
    );
  });

  describe("mint", () => {
    it("should mint from owner", async () => {
      await soulBoundIdentityRouter
        .connect(owner)
        .mintIdentityWithName(address1.address, SOULBOUND_NAME1);
    });

    it("should fail to mint twice", async () => {
      await soulBoundIdentityRouter
        .connect(owner)
        .mintIdentityWithName(address1.address, SOULBOUND_NAME1);
      await expect(
        soulBoundIdentityRouter
          .connect(owner)
          .mintIdentityWithName(address1.address, SOULBOUND_NAME2)
      ).to.be.rejectedWith("Soulbound identity already created!");
    });

    it("should fail to mint duplicated name", async () => {
      await soulBoundIdentityRouter
        .connect(owner)
        .mintIdentityWithName(address1.address, SOULBOUND_NAME1);
      await expect(
        soulBoundIdentityRouter
          .connect(owner)
          .mintIdentityWithName(address2.address, SOULBOUND_NAME1)
      ).to.be.rejectedWith("NAME_ALREADY_EXISTS");
    });
  });
});
