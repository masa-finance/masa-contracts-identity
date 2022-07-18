// @ts-ignore
import chai from "chai";
// @ts-ignore
import chaiAsPromised from "chai-as-promised";
import {
  // @ts-ignore
  ethers,
  // @ts-ignore
  deployments,
} from "hardhat";
import type * as ethersTypes from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

chai.use(chaiAsPromised);
const expect = chai.expect;

// contract instances
let soulBoundIdentity: ethersTypes.Contract;

let owner: SignerWithAddress;
let someone: SignerWithAddress;

describe("SoulBoundIdentity", () => {
  before(async () => {
    [, owner, someone] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulBoundIdentity", { fallbackToGlobal: false });

    const { address: soulBoundIdentityAddress } = await deployments.get(
      "SoulBoundIdentity"
    );
    soulBoundIdentity = await ethers.getContractAt(
      "SoulBoundIdentity",
      soulBoundIdentityAddress
    );
  });

  it("should mint from owner", async () => {
    // console.log(soulBoundIdentity)
    await soulBoundIdentity.connect(owner).mint(someone.address);
  });

  it("should fail to mint from someone", async () => {
    await expect(
      soulBoundIdentity.connect(someone).mint(someone.address)
    ).to.be.rejectedWith(
      "ERC721PresetMinterPauserAutoId: must have minter role to mint"
    );
  });
});
