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

describe("Soulbound Identity", () => {
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
    await soulBoundIdentity.connect(owner).mint(someone.address);
  });

  it("should burn", async () => {
    const mintTx = await soulBoundIdentity.connect(owner).mint(someone.address);
    const mintReceipt = await mintTx.wait();

    const tokenId = mintReceipt.events[0].args[2].toNumber();
    await soulBoundIdentity.connect(someone).burn(tokenId);
  });

  it("should fail to mint twice", async () => {
    await soulBoundIdentity.connect(owner).mint(someone.address);
    await expect(
      soulBoundIdentity.connect(owner).mint(someone.address)
    ).to.be.rejectedWith("Soulbound identity already created!");
  });

  it("should fail to transfer because its soul bound", async () => {
    await soulBoundIdentity.connect(owner).mint(someone.address);

    await expect(
      soulBoundIdentity
        .connect(someone)
        .transferFrom(someone.address, someone.address, 1)
    ).to.be.rejectedWith("Transferring Soul Bound Tokens is not permitted!");
  });

  it("should fail to mint from someone", async () => {
    await expect(
      soulBoundIdentity.connect(someone).mint(someone.address)
    ).to.be.rejectedWith(
      "ERC721PresetMinterPauserAutoId: must have minter role to mint"
    );
  });
});
