import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments, getChainId } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  ERC20,
  ERC20__factory,
  IUniswapRouter,
  IUniswapRouter__factory,
  SoulboundCreditScore,
  SoulboundCreditScore__factory,
  SoulboundIdentity,
  SoulboundIdentity__factory,
  SoulLinker,
  SoulLinker__factory
} from "../typechain";
import { BigNumber } from "ethers";
import { MASA_GOERLI, SWAPROUTER_GOERLI, WETH_GOERLI } from "../src/constants";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulboundIdentity: SoulboundIdentity;
let soulboundCreditScore: SoulboundCreditScore;
let soulLinker: SoulLinker;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;
let authority: SignerWithAddress;

let ownerIdentityId: number;
let readerIdentityId: number;
let creditScore1: number;

const data = '{"data1","data2"}';
const signatureDate = Math.floor(Date.now() / 1000);
const expirationDate = Math.floor(Date.now() / 1000) + 60 * 15;

const signLink = async (
  readerIdentityId: number,
  ownerIdentityId: number,
  token: string,
  tokenId: number
) => {
  const chainId = await getChainId();

  const signature = await address1._signTypedData(
    // Domain
    {
      name: "SoulLinker",
      version: "1.0.0",
      chainId: chainId,
      verifyingContract: soulLinker.address
    },
    // Types
    {
      Link: [
        { name: "readerIdentityId", type: "uint256" },
        { name: "ownerIdentityId", type: "uint256" },
        { name: "token", type: "address" },
        { name: "tokenId", type: "uint256" },
        { name: "data", type: "string" },
        { name: "signatureDate", type: "uint256" },
        { name: "expirationDate", type: "uint256" }
      ]
    },
    // Value
    {
      readerIdentityId: readerIdentityId,
      ownerIdentityId: ownerIdentityId,
      token: token,
      tokenId: tokenId,
      data: data,
      signatureDate: signatureDate,
      expirationDate: expirationDate
    }
  );

  return signature;
};

const signMintCreditScore = async (
  identityId: number,
  authoritySigner: SignerWithAddress
) => {
  const chainId = await getChainId();

  const signature = await authoritySigner._signTypedData(
    // Domain
    {
      name: "SoulboundCreditScore",
      version: "1.0.0",
      chainId: chainId,
      verifyingContract: soulboundCreditScore.address
    },
    // Types
    {
      MintCreditScore: [
        { name: "identityId", type: "uint256" },
        { name: "authorityAddress", type: "address" },
        { name: "signatureDate", type: "uint256" }
      ]
    },
    // Value
    {
      identityId: identityId,
      authorityAddress: authoritySigner.address,
      signatureDate: signatureDate
    }
  );

  return signature;
};

describe("Soul Linker", () => {
  before(async () => {
    [, owner, address1, address2, authority] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulboundCreditScore", {
      fallbackToGlobal: false
    });
    await deployments.fixture("SoulLinker", { fallbackToGlobal: false });

    const { address: soulboundIdentityAddress } = await deployments.get(
      "SoulboundIdentity"
    );
    const { address: soulboundCreditScoreAddress } = await deployments.get(
      "SoulboundCreditScore"
    );
    const { address: soulLinkerAddress } = await deployments.get("SoulLinker");

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );
    soulboundCreditScore = SoulboundCreditScore__factory.connect(
      soulboundCreditScoreAddress,
      owner
    );
    soulLinker = SoulLinker__factory.connect(soulLinkerAddress, owner);

    // we mint identity SBT for address1
    let mintTx = await soulboundIdentity.connect(owner).mint(address1.address);
    let mintReceipt = await mintTx.wait();

    ownerIdentityId = mintReceipt.events![0].args![1].toNumber();

    // we mint identity SBT for address2
    mintTx = await soulboundIdentity.connect(owner).mint(address2.address);
    mintReceipt = await mintTx.wait();

    readerIdentityId = mintReceipt.events![0].args![1].toNumber();

    // we add authority account
    await soulboundCreditScore.addAuthority(authority.address);

    // we mint credit score SBT for address1
    const signatureMintCreditScore = await signMintCreditScore(
      ownerIdentityId,
      authority
    );

    mintTx = await soulboundCreditScore
      .connect(address1)
      ["mint(address,address,address,uint256,bytes)"](
        ethers.constants.AddressZero,
        address1.address,
        authority.address,
        signatureDate,
        signatureMintCreditScore
      );
    mintReceipt = await mintTx.wait();

    creditScore1 = mintReceipt.events![0].args![1].toNumber();

    const uniswapRouter: IUniswapRouter = IUniswapRouter__factory.connect(
      SWAPROUTER_GOERLI,
      owner
    );

    // we get MASA utility tokens for address1
    await uniswapRouter.swapExactETHForTokens(
      0,
      [WETH_GOERLI, MASA_GOERLI],
      address1.address,
      Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
      {
        value: ethers.utils.parseEther("10")
      }
    );

    // we add payment methods
    await soulLinker.connect(owner).addErc20Token(MASA_GOERLI);
  });

  describe("owner functions", () => {
    it("should set SoulboundIdentity from owner", async () => {
      await soulLinker.connect(owner).setSoulboundIdentity(address1.address);

      expect(await soulLinker.soulboundIdentity()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set SoulboundIdentity from non owner", async () => {
      await expect(
        soulLinker.connect(address1).setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });

    it("should add linked SBT from owner", async () => {
      await soulLinker.connect(owner).addLinkedSBT(address1.address);

      expect(await soulLinker.linkedSBT(address1.address)).to.be.true;
    });

    it("should fail to add linked SBT from non owner", async () => {
      await expect(soulLinker.connect(address1).addLinkedSBT(address1.address))
        .to.be.rejected;
    });

    it("should fail to add already existing linked SBT from owner", async () => {
      await expect(
        soulLinker.connect(owner).addLinkedSBT(soulboundCreditScore.address)
      ).to.be.rejected;
    });

    it("should remove linked SBT from owner", async () => {
      await soulLinker
        .connect(owner)
        .removeLinkedSBT(soulboundCreditScore.address);

      expect(await soulLinker.linkedSBT(soulboundCreditScore.address)).to.be
        .false;
    });

    it("should fail to remove linked SBT from non owner", async () => {
      await expect(
        soulLinker
          .connect(address1)
          .removeLinkedSBT(soulboundCreditScore.address)
      ).to.be.rejected;
    });

    it("should fail to remove non existing linked SBT from owner", async () => {
      await expect(soulLinker.connect(owner).removeLinkedSBT(address1.address))
        .to.be.rejected;
    });

    it("should set NameRegistrationPricePerYear from owner", async () => {
      const newPrice = 100;
      await soulLinker.connect(owner).setAddPermissionPrice(newPrice);

      expect(await soulLinker.addPermissionPrice()).to.be.equal(newPrice);
    });

    it("should fail to set MintingNamePrice from non owner", async () => {
      const newPrice = 100;
      await expect(soulLinker.connect(address1).setAddPermissionPrice(newPrice))
        .to.be.rejected;
    });

    it("should set StableCoin from owner", async () => {
      await soulLinker.connect(owner).setStableCoin(address1.address);

      expect(await soulLinker.stableCoin()).to.be.equal(address1.address);
    });

    it("should fail to set StableCoin from non owner", async () => {
      await expect(soulLinker.connect(address1).setStableCoin(address1.address))
        .to.be.rejected;
    });

    it("should set MasaToken from owner", async () => {
      await soulLinker.connect(owner).setMasaToken(address1.address);

      expect(await soulLinker.masaToken()).to.be.equal(address1.address);
    });

    it("should fail to set MasaToken from non owner", async () => {
      await expect(soulLinker.connect(address1).setMasaToken(address1.address))
        .to.be.rejected;
    });

    it("should set ReserveWallet from owner", async () => {
      await soulLinker.connect(owner).setReserveWallet(address1.address);

      expect(await soulLinker.reserveWallet()).to.be.equal(address1.address);
    });

    it("should fail to set ReserveWallet from non owner", async () => {
      await expect(
        soulLinker.connect(address1).setReserveWallet(address1.address)
      ).to.be.rejected;
    });

    it("should set SwapRouter from owner", async () => {
      await soulLinker.connect(owner).setSwapRouter(address1.address);

      expect(await soulLinker.swapRouter()).to.be.equal(address1.address);
    });

    it("should fail to set SwapRouter from non owner", async () => {
      await expect(soulLinker.connect(address1).setSwapRouter(address1.address))
        .to.be.rejected;
    });

    it("should set WrappedNativeToken from owner", async () => {
      await soulLinker.connect(owner).setWrappedNativeToken(address1.address);

      expect(await soulLinker.wrappedNativeToken()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set WrappedNativeToken from non owner", async () => {
      await expect(
        soulLinker.connect(address1).setWrappedNativeToken(address1.address)
      ).to.be.rejected;
    });
  });

  describe("test pausable", () => {
    it("should pause", async () => {
      await soulLinker.connect(owner).pause();

      expect(await soulLinker.paused()).to.be.true;
    });

    it("should unpause", async () => {
      await soulLinker.connect(owner).pause();
      await soulLinker.connect(owner).unpause();

      expect(await soulLinker.paused()).to.be.false;
    });

    it("should fail to pause from non owner", async () => {
      await expect(soulLinker.connect(address1).pause()).to.be.rejected;
    });

    it("should fail to unpause from non owner", async () => {
      await expect(soulLinker.connect(address1).unpause()).to.be.rejected;
    });
  });

  describe("read link information", () => {
    it("should get identity id", async () => {
      expect(
        await soulLinker.getIdentityId(
          soulboundCreditScore.address,
          creditScore1
        )
      ).to.be.equal(ownerIdentityId);
    });

    it("should get SBT links by identityId", async () => {
      expect(
        await soulLinker["getSBTLinks(uint256,address)"](
          ownerIdentityId,
          soulboundCreditScore.address
        )
      ).to.deep.equal([BigNumber.from(creditScore1)]);
    });

    it("should get SBT links by owner address", async () => {
      expect(
        await soulLinker["getSBTLinks(address,address)"](
          address1.address,
          soulboundCreditScore.address
        )
      ).to.deep.equal([BigNumber.from(creditScore1)]);
    });
  });

  describe("addPermission", () => {
    it("addPermission must work with a valid signature", async () => {
      const signature = await signLink(
        readerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      const { price, paymentMethodUsed } =
        await soulLinker.getPriceForAddPermission(MASA_GOERLI);

      // set allowance for soul store
      const masa: ERC20 = ERC20__factory.connect(paymentMethodUsed, owner);
      await masa.connect(address1).approve(soulLinker.address, price);

      await soulLinker
        .connect(address1)
        .addPermission(
          paymentMethodUsed,
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          data,
          signatureDate,
          expirationDate,
          signature
        );

      const permissionSignatureDates =
        await soulLinker.getPermissionSignatureDates(
          soulboundCreditScore.address,
          creditScore1,
          readerIdentityId
        );
      expect(permissionSignatureDates[0]).to.be.equal(signatureDate);

      const {
        ownerIdentityId: ownerIdentityIdInfo,
        data: dataInfo,
        expirationDate: expirationDateInfo,
        isRevoked: isRevokedInfo
      } = await soulLinker.getPermissionInfo(
        soulboundCreditScore.address,
        creditScore1,
        readerIdentityId,
        signatureDate
      );
      expect(ownerIdentityIdInfo).to.be.equal(ownerIdentityId);
      expect(dataInfo).to.be.equal(data);
      expect(expirationDateInfo).to.be.equal(expirationDate);
      expect(isRevokedInfo).to.be.equal(false);

      const dataWithPermissions = await soulLinker
        .connect(address2)
        .validatePermission(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      expect(dataWithPermissions).to.be.equal(data);
    });

    it("addPermission must work paying with MASA without an exchange rate", async () => {
      await soulLinker.connect(owner).setAddPermissionPriceMASA(10);
      expect(await soulLinker.addPermissionPriceMASA()).to.be.equal(10);

      const signature = await signLink(
        readerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      const { price, paymentMethodUsed } =
        await soulLinker.getPriceForAddPermission(MASA_GOERLI);
      expect(price).to.be.equal(10);

      // set allowance for soul store
      const masa: ERC20 = ERC20__factory.connect(paymentMethodUsed, owner);
      await masa.connect(address1).approve(soulLinker.address, price);

      await soulLinker
        .connect(address1)
        .addPermission(
          paymentMethodUsed,
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          data,
          signatureDate,
          expirationDate,
          signature
        );

      const permissionSignatureDates =
        await soulLinker.getPermissionSignatureDates(
          soulboundCreditScore.address,
          creditScore1,
          readerIdentityId
        );
      expect(permissionSignatureDates[0]).to.be.equal(signatureDate);

      const {
        ownerIdentityId: ownerIdentityIdInfo,
        data: dataInfo,
        expirationDate: expirationDateInfo,
        isRevoked: isRevokedInfo
      } = await soulLinker.getPermissionInfo(
        soulboundCreditScore.address,
        creditScore1,
        readerIdentityId,
        signatureDate
      );
      expect(ownerIdentityIdInfo).to.be.equal(ownerIdentityId);
      expect(dataInfo).to.be.equal(data);
      expect(expirationDateInfo).to.be.equal(expirationDate);
      expect(isRevokedInfo).to.be.equal(false);

      const dataWithPermissions = await soulLinker
        .connect(address2)
        .validatePermission(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      expect(dataWithPermissions).to.be.equal(data);
    });

    it("addPermission won't work with an invalid signature", async () => {
      const signature = await signLink(
        ownerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      const { price, paymentMethodUsed } =
        await soulLinker.getPriceForAddPermission(MASA_GOERLI);

      // set allowance for soul store
      const masa: ERC20 = ERC20__factory.connect(paymentMethodUsed, owner);
      await masa.connect(address1).approve(soulLinker.address, price);

      await expect(
        soulLinker
          .connect(address1)
          .addPermission(
            paymentMethodUsed,
            readerIdentityId,
            ownerIdentityId,
            soulboundCreditScore.address,
            creditScore1,
            data,
            signatureDate,
            expirationDate,
            signature
          )
      ).to.be.rejected;

      await expect(
        soulLinker
          .connect(address2)
          .validatePermission(
            readerIdentityId,
            ownerIdentityId,
            soulboundCreditScore.address,
            creditScore1,
            signatureDate
          )
      ).to.be.rejected;
    });
  });

  describe("revokePermission", () => {
    it("non owner of data can't call revokePermission", async () => {
      const signature = await signLink(
        readerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      const { price, paymentMethodUsed } =
        await soulLinker.getPriceForAddPermission(MASA_GOERLI);

      // set allowance for soul store
      const masa: ERC20 = ERC20__factory.connect(paymentMethodUsed, owner);
      await masa.connect(address1).approve(soulLinker.address, price);

      await soulLinker
        .connect(address1)
        .addPermission(
          paymentMethodUsed,
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          data,
          signatureDate,
          expirationDate,
          signature
        );

      await expect(
        soulLinker
          .connect(address2)
          .revokePermission(
            readerIdentityId,
            ownerIdentityId,
            soulboundCreditScore.address,
            creditScore1,
            signatureDate
          )
      ).to.be.rejected;

      const dataWithPermissions = await soulLinker
        .connect(address2)
        .validatePermission(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      expect(dataWithPermissions).to.be.equal(data);
    });

    it("owner of data can call revokePermission", async () => {
      const signature = await signLink(
        readerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      const { price, paymentMethodUsed } =
        await soulLinker.getPriceForAddPermission(MASA_GOERLI);

      // set allowance for soul store
      const masa: ERC20 = ERC20__factory.connect(paymentMethodUsed, owner);
      await masa.connect(address1).approve(soulLinker.address, price);

      await soulLinker
        .connect(address1)
        .addPermission(
          paymentMethodUsed,
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          data,
          signatureDate,
          expirationDate,
          signature
        );

      const dataWithPermissions = await soulLinker
        .connect(address2)
        .validatePermission(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      expect(dataWithPermissions).to.be.equal(data);

      await soulLinker
        .connect(address1)
        .revokePermission(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      await expect(
        soulLinker
          .connect(address2)
          .validatePermission(
            readerIdentityId,
            ownerIdentityId,
            soulboundCreditScore.address,
            creditScore1,
            signatureDate
          )
      ).to.be.rejected;
    });
  });
});
