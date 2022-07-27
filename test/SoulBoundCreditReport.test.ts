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
let soulBoundCreditReport: ethersTypes.Contract;

let owner: SignerWithAddress;
let someone: SignerWithAddress;

describe("Soulbound Credit Report", () => {
  before(async () => {
    [, owner, someone] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulBoundCreditReport", {
      fallbackToGlobal: false,
    });

    const { address: soulBoundCreditReportAddress } = await deployments.get(
      "SoulBoundCreditReport"
    );
    soulBoundCreditReport = await ethers.getContractAt(
      "SoulBoundCreditReport",
      soulBoundCreditReportAddress
    );
  });

  it("should mint from owner", async () => {
    await soulBoundCreditReport.connect(owner).mint(someone.address);
  });

  it("should mint twice", async () => {
    await soulBoundCreditReport.connect(owner).mint(someone.address);
    await soulBoundCreditReport.connect(owner).mint(someone.address);
  });

  it("should fail to transfer because its soul bound", async () => {
    await soulBoundCreditReport.connect(owner).mint(someone.address);

    await expect(
      soulBoundCreditReport
        .connect(someone)
        .transferFrom(someone.address, someone.address, 1)
    ).to.be.rejectedWith("Transferring Soul Bound Tokens is not permitted!");
  });

  it("should fail to mint from someone", async () => {
    await expect(
      soulBoundCreditReport.connect(someone).mint(someone.address)
    ).to.be.rejectedWith(
      "ERC721PresetMinterPauserAutoId: must have minter role to mint"
    );
  });
});
