import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  SoulboundIdentity,
  SoulboundIdentity__factory,
  SoulName,
  SoulName__factory,
  SoulFactory,
  SoulFactory__factory
} from "../typechain";
import { DAI_RINKEBY, USDC_RINKEBY } from "../src/constants";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulboundIdentity: SoulboundIdentity;
let soulName: SoulName;
let soulFactory: SoulFactory;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

const MINTING_IDENTITY_AND_NAME_PRICE = "5000000"; // 5 USDC, with 6 decimals
const MINTING_IDENTITY_PRICE = "3000000"; // 3 USDC, with 6 decimals
const MINTING_NAME_PRICE = "3000000"; // 3 USDC, with 6 decimals

const SOUL_NAME1 = "soulNameTest1";
const SOUL_NAME2 = "soulNameTest2";

describe("Soul Factory", () => {
  before(async () => {
    [, owner, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulName", { fallbackToGlobal: false });
    await deployments.fixture("SoulFactory", { fallbackToGlobal: false });

    const { address: soulboundIdentityAddress } = await deployments.get(
      "SoulboundIdentity"
    );
    const { address: soulNameAddress } = await deployments.get("SoulName");
    const { address: soulFactoryAddress } = await deployments.get(
      "SoulFactory"
    );

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );
    soulName = SoulName__factory.connect(soulNameAddress, owner);
    soulFactory = SoulFactory__factory.connect(soulFactoryAddress, owner);
  });

  describe("pause", () => {
    it("should pause from owner", async () => {
      await soulFactory.connect(owner).pause();

      expect(await soulFactory.paused()).to.be.true;
    });

    it("should unpause from owner", async () => {
      await soulFactory.connect(owner).pause();

      expect(await soulFactory.paused()).to.be.true;

      await soulFactory.connect(owner).unpause();

      expect(await soulFactory.paused()).to.be.false;
    });

    it("should fail to pause from non owner", async () => {
      await expect(soulFactory.connect(address1).pause()).to.be.rejected;
    });

    it("should fail to unpause from non owner", async () => {
      await soulFactory.connect(owner).pause();

      expect(await soulFactory.paused()).to.be.true;

      await expect(soulFactory.connect(address1).unpause()).to.be.rejected;
    });
  });

  describe("admin functions", () => {
    it("should set SoulboundIdentity from admin", async () => {
      await soulFactory.connect(owner).setSoulboundIdentity(address1.address);

      expect(await soulFactory.soulboundIdentity()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set SoulboundIdentity from non admin", async () => {
      await expect(
        soulFactory.connect(address1).setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });

    it("should set MintingIdentityPrice from admin", async () => {
      const newPrice = 100;
      await soulFactory.connect(owner).setMintingIdentityPrice(newPrice);

      expect(await soulFactory.mintingIdentityPrice()).to.be.equal(newPrice);
    });

    it("should fail to set MintingIdentityPrice from non admin", async () => {
      const newPrice = 100;
      await expect(
        soulFactory.connect(address1).setMintingIdentityPrice(newPrice)
      ).to.be.rejected;
    });

    it("should set MintingNamePrice from admin", async () => {
      const newPrice = 100;
      await soulFactory.connect(owner).setMintingNamePrice(newPrice);

      expect(await soulFactory.mintingNamePrice()).to.be.equal(newPrice);
    });

    it("should fail to set MintingNamePrice from non admin", async () => {
      const newPrice = 100;
      await expect(soulFactory.connect(address1).setMintingNamePrice(newPrice))
        .to.be.rejected;
    });

    it("should set StableCoin from admin", async () => {
      await soulFactory.connect(owner).setStableCoin(address1.address);

      expect(await soulFactory.stableCoin()).to.be.equal(address1.address);
    });

    it("should fail to set StableCoin from non admin", async () => {
      await expect(
        soulFactory.connect(address1).setStableCoin(address1.address)
      ).to.be.rejected;
    });

    it("should set UtilityToken from admin", async () => {
      await soulFactory.connect(owner).setUtilityToken(address1.address);

      expect(await soulFactory.utilityToken()).to.be.equal(address1.address);
    });

    it("should fail to set UtilityToken from non admin", async () => {
      await expect(
        soulFactory.connect(address1).setUtilityToken(address1.address)
      ).to.be.rejected;
    });

    it("should set ReserveWallet from admin", async () => {
      await soulFactory.connect(owner).setReserveWallet(address1.address);

      expect(await soulFactory.reserveWallet()).to.be.equal(address1.address);
    });

    it("should fail to set ReserveWallet from non admin", async () => {
      await expect(
        soulFactory.connect(address1).setReserveWallet(address1.address)
      ).to.be.rejected;
    });
  });

  describe("purchase info", () => {
    it("we can get identity and name purchase info", async () => {
      const [priceInStableCoin, priceInETH, priceInUtilityToken] =
        await soulFactory.purchaseIdentityAndNameInfo();

      expect(priceInStableCoin).to.be.equal(MINTING_IDENTITY_AND_NAME_PRICE);
      expect(priceInETH).to.be.within(7000000, 11000000);
      expect(priceInUtilityToken).to.be.within(3000000000, 7000000000);
    });

    it("we can get identity purchase info", async () => {
      const [priceInStableCoin, priceInETH, priceInUtilityToken] =
        await soulFactory.purchaseIdentityInfo();

      expect(priceInStableCoin).to.be.equal(MINTING_IDENTITY_PRICE);
      expect(priceInETH).to.be.within(4000000, 6000000);
      expect(priceInUtilityToken).to.be.within(2000000000, 4000000000);
    });

    it("we can get name purchase info", async () => {
      const [priceInStableCoin, priceInETH, priceInUtilityToken] =
        await soulFactory.purchaseNameInfo();

      expect(priceInStableCoin).to.be.equal(MINTING_NAME_PRICE);
      expect(priceInETH).to.be.within(4000000, 6000000);
      expect(priceInUtilityToken).to.be.within(2000000000, 4000000000);
    });
  });

  describe("purchase identity and name", () => {
    it("we can purchase an identity and name with ETH", async () => {
      const [, priceInETH] = await soulFactory.purchaseIdentityAndNameInfo();

      await soulFactory.connect(address1).purchaseIdentityAndName(
        ethers.constants.AddressZero, // ETH
        SOUL_NAME1,
        { value: priceInETH }
      );
    });

    it("we can't purchase an identity and name with ETH if we pay less", async () => {
      const [, priceInETH] = await soulFactory.purchaseIdentityAndNameInfo();

      await expect(
        soulFactory.connect(address1).purchaseIdentityAndName(
          ethers.constants.AddressZero, // ETH
          SOUL_NAME1,
          { value: priceInETH.div(2) }
        )
      ).to.be.rejectedWith('INVALID_PAYMENT_AMOUNT');
    });
  });

  describe("purchase identity", () => {
    it("we can purchase an identity with ETH", async () => {
      const [, priceInETH] = await soulFactory.purchaseIdentityInfo();

      await soulFactory.connect(address1).purchaseIdentity(
        ethers.constants.AddressZero, // ETH
        { value: priceInETH }
      );
    });

    /* it("we can purchase an identity with stable coin", async () => {
      await soulFactory.connect(address1).purchaseIdentity(
        USDC_RINKEBY // USDC
      );
    });

    it("we can purchase an identity with utility coin", async () => {
      await soulFactory.connect(address1).purchaseIdentity(
        DAI_RINKEBY // $CORN
      );
    }); */

    it("we can't purchase an identity with ETH if we pay less", async () => {
      const [, priceInETH] = await soulFactory.purchaseIdentityInfo();

      await expect(
        soulFactory.connect(address1).purchaseIdentity(
          ethers.constants.AddressZero, // ETH
          { value: priceInETH.div(2) }
        )
      ).to.be.rejectedWith('INVALID_PAYMENT_AMOUNT');
    });
/*
    it("we can't purchase an identity with stable coin if we don't have funds", async () => {
      await expect(
        soulFactory.connect(address1).purchaseIdentity(
          USDC_RINKEBY // USDC
        )
      ).to.be.rejected;
    });

    it("we can't purchase an identity with utility coin if we don't have funds", async () => {
      await expect(
        soulFactory.connect(address1).purchaseIdentity(
          DAI_RINKEBY // $CORN
        )
      ).to.be.rejected;
    }); */
  });

  describe("purchase name", () => {
    it("we can purchase a name with ETH", async () => {
      const [, priceInETHIdentity] = await soulFactory.purchaseIdentityInfo();
      const [, priceInETHName] = await soulFactory.purchaseNameInfo();

      // first we need to purchase an identity
      await soulFactory.connect(address1).purchaseIdentity(
        ethers.constants.AddressZero, // ETH
        { value: priceInETHIdentity }
      );

      await soulFactory.connect(address1).purchaseName(
        ethers.constants.AddressZero, // ETH
        SOUL_NAME1,
        { value: priceInETHName }
      );
    });
  });

  it("we can't purchase an identity and name with ETH if we pay less", async () => {
    const [, priceInETHIdentity] = await soulFactory.purchaseIdentityInfo();
    const [, priceInETHName] = await soulFactory.purchaseNameInfo();

    // first we need to purchase an identity
    await soulFactory.connect(address1).purchaseIdentity(
      ethers.constants.AddressZero, // ETH
      { value: priceInETHIdentity }
    );

    await expect(
      soulFactory.connect(address1).purchaseIdentityAndName(
        ethers.constants.AddressZero, // ETH
        SOUL_NAME1,
        { value: priceInETHName.div(2) }
      )
    ).to.be.rejectedWith('INVALID_PAYMENT_AMOUNT');
  });
});
