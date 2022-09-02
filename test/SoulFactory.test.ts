import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SoulFactory, SoulFactory__factory } from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulFactory: SoulFactory;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

describe("Soul Factory", () => {
  before(async () => {
    [, owner, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulFactory", { fallbackToGlobal: false });

    const { address: soulFactoryAddress } = await deployments.get(
      "SoulFactory"
    );

    soulFactory = SoulFactory__factory.connect(soulFactoryAddress, owner);
  });

  describe("purchase info", () => {
    it("we can get purchase info", async () => {
      console.log(await soulFactory.purchaseIdentityInfo());
    });
  });
});
