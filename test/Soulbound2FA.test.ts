import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  Soulbound2FA,
  Soulbound2FA__factory,
  SoulboundIdentity,
  SoulboundIdentity__factory
} from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulboundIdentity: SoulboundIdentity;
let soulbound2FA: Soulbound2FA;

let owner: SignerWithAddress;
let someone: SignerWithAddress;

describe("Soulbound Two-factor authentication (2FA)", () => {
  before(async () => {
    [, owner, someone] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: true });
    await deployments.fixture("Soulbound2FA", {
      fallbackToGlobal: true
    });

    const { address: soulboundIdentityAddress } = await deployments.get(
      "SoulboundIdentity"
    );
    const { address: soulbound2FAAddress } = await deployments.get(
      "Soulbound2FA"
    );

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );
    soulbound2FA = Soulbound2FA__factory.connect(soulbound2FAAddress, owner);

    // we mint identity SBT
    await soulboundIdentity.connect(owner).mint(someone.address);
  });

  describe("mint", () => {
    it("should mint from owner", async () => {
      await soulbound2FA.connect(owner).mint(someone.address);
    });

    it("should mint twice", async () => {
      await soulbound2FA.connect(owner).mint(someone.address);
      await soulbound2FA.connect(owner).mint(someone.address);
    });

    it("should fail to mint from someone", async () => {
      await expect(soulbound2FA.connect(someone).mint(someone.address)).to.be
        .rejected;
    });
  });

  describe("tokenUri", () => {
    it("should fail to transfer because its soulbound", async () => {
      const mintTx = await soulbound2FA.connect(owner).mint(someone.address);

      const mintReceipt = await mintTx.wait();
      const tokenId = mintReceipt.events![0].args![1].toNumber();
      const tokenUri = await soulbound2FA.tokenURI(tokenId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/2fa/");
    });
  });
});
