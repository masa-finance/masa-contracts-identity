import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { deployments, ethers, getChainId } from "hardhat";
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
let someone: SignerWithAddress;
let dataOwner: SignerWithAddress;
let dataReader: SignerWithAddress;
let authority: SignerWithAddress;

let ownerIdentityId: number;
let readerIdentityId: number;
let creditScore1: number;

const signatureDate = Math.floor(Date.now() / 1000);
const expirationDate = Math.floor(Date.now() / 1000) + 60 * 15;

const signLink = async (
  readerIdentityId: number,
  ownerIdentityId: number,
  token: string,
  tokenId: number
) => {
  const chainId = await getChainId();

  const signature = await dataOwner._signTypedData(
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
    [, owner, dataOwner, dataReader, authority, , , , someone] =
      await ethers.getSigners();
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

    // we mint identity SBT for dataOwner
    let mintTx = await soulboundIdentity.connect(owner).mint(dataOwner.address);
    let mintReceipt = await mintTx.wait();

    ownerIdentityId = mintReceipt.events![0].args![1].toNumber();

    // we mint identity SBT for dataReader
    mintTx = await soulboundIdentity.connect(owner).mint(dataReader.address);
    mintReceipt = await mintTx.wait();

    readerIdentityId = mintReceipt.events![0].args![1].toNumber();

    // we add authority account
    await soulboundCreditScore.addAuthority(authority.address);

    // we mint credit score SBT for dataOwner
    const signatureMintCreditScore = await signMintCreditScore(
      ownerIdentityId,
      authority
    );

    mintTx = await soulboundCreditScore
      .connect(dataOwner)
      ["mint(address,address,address,uint256,bytes)"](
        ethers.constants.AddressZero,
        dataOwner.address,
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

    // we get MASA utility tokens for dataReader
    await uniswapRouter.swapExactETHForTokens(
      0,
      [WETH_GOERLI, MASA_GOERLI],
      dataReader.address,
      Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
      {
        value: ethers.utils.parseEther("10")
      }
    );

    // we add payment methods
    await soulLinker
      .connect(owner)
      .enablePaymentMethod(ethers.constants.AddressZero);
    await soulLinker.connect(owner).enablePaymentMethod(MASA_GOERLI);
  });

  describe("owner functions", () => {
    it("should set SoulboundIdentity from owner", async () => {
      await soulLinker.connect(owner).setSoulboundIdentity(someone.address);

      expect(await soulLinker.soulboundIdentity()).to.be.equal(someone.address);
    });

    it("should fail to set SoulboundIdentity from non owner", async () => {
      await expect(
        soulLinker.connect(someone).setSoulboundIdentity(someone.address)
      ).to.be.rejected;
    });

    it("should set NameRegistrationPricePerYear from owner", async () => {
      const newPrice = 100;
      await soulboundCreditScore.connect(owner).setAddPermissionPrice(newPrice);

      expect(await soulboundCreditScore.addPermissionPrice()).to.be.equal(
        newPrice
      );
    });

    it("should fail to set MintingNamePrice from non owner", async () => {
      const newPrice = 100;
      await expect(
        soulboundCreditScore.connect(someone).setAddPermissionPrice(newPrice)
      ).to.be.rejected;
    });

    it("should set StableCoin from owner", async () => {
      await soulLinker.connect(owner).setStableCoin(someone.address);

      expect(await soulLinker.stableCoin()).to.be.equal(someone.address);
    });

    it("should fail to set StableCoin from non owner", async () => {
      await expect(soulLinker.connect(someone).setStableCoin(someone.address))
        .to.be.rejected;
    });

    it("should set MasaToken from owner", async () => {
      await soulLinker.connect(owner).setMasaToken(someone.address);

      expect(await soulLinker.masaToken()).to.be.equal(someone.address);
    });

    it("should fail to set MasaToken from non owner", async () => {
      await expect(soulLinker.connect(someone).setMasaToken(someone.address)).to
        .be.rejected;
    });

    it("should set ReserveWallet from owner", async () => {
      await soulLinker.connect(owner).setReserveWallet(someone.address);

      expect(await soulLinker.reserveWallet()).to.be.equal(someone.address);
    });

    it("should fail to set ReserveWallet from non owner", async () => {
      await expect(
        soulLinker.connect(someone).setReserveWallet(someone.address)
      ).to.be.rejected;
    });

    it("should set SwapRouter from owner", async () => {
      await soulLinker.connect(owner).setSwapRouter(someone.address);

      expect(await soulLinker.swapRouter()).to.be.equal(someone.address);
    });

    it("should fail to set SwapRouter from non owner", async () => {
      await expect(soulLinker.connect(someone).setSwapRouter(someone.address))
        .to.be.rejected;
    });

    it("should set WrappedNativeToken from owner", async () => {
      await soulLinker.connect(owner).setWrappedNativeToken(someone.address);

      expect(await soulLinker.wrappedNativeToken()).to.be.equal(
        someone.address
      );
    });

    it("should fail to set WrappedNativeToken from non owner", async () => {
      await expect(
        soulLinker.connect(someone).setWrappedNativeToken(someone.address)
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
      await expect(soulLinker.connect(someone).pause()).to.be.rejected;
    });

    it("should fail to unpause from non owner", async () => {
      await expect(soulLinker.connect(someone).unpause()).to.be.rejected;
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

    it("should get SBT connections by identityId", async () => {
      expect(
        await soulLinker["getSBTConnections(uint256,address)"](
          ownerIdentityId,
          soulboundCreditScore.address
        )
      ).to.deep.equal([BigNumber.from(creditScore1)]);
    });

    it("should get SBT connections by owner address", async () => {
      expect(
        await soulLinker["getSBTConnections(address,address)"](
          dataOwner.address,
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

      const price = await soulLinker.getPriceForAddPermission(
        MASA_GOERLI,
        soulboundCreditScore.address
      );

      // set allowance for soul store
      const masa: ERC20 = ERC20__factory.connect(MASA_GOERLI, owner);
      await masa.connect(dataReader).approve(soulLinker.address, price);

      await soulLinker
        .connect(dataReader)
        .addPermission(
          MASA_GOERLI,
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
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
        expirationDate: expirationDateInfo,
        isRevoked: isRevokedInfo
      } = await soulLinker.getPermissionInfo(
        soulboundCreditScore.address,
        creditScore1,
        readerIdentityId,
        signatureDate
      );
      expect(ownerIdentityIdInfo).to.be.equal(ownerIdentityId);
      expect(expirationDateInfo).to.be.equal(expirationDate);
      expect(isRevokedInfo).to.be.equal(false);

      const valid = await soulLinker
        .connect(dataReader)
        .validatePermission(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      expect(valid).to.be.true;
    });

    it("addPermission must work paying with MASA without an exchange rate", async () => {
      await soulboundCreditScore.connect(owner).setAddPermissionPriceMASA(10);
      expect(await soulboundCreditScore.addPermissionPriceMASA()).to.be.equal(
        10
      );

      const signature = await signLink(
        readerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      const price = await soulLinker.getPriceForAddPermission(
        MASA_GOERLI,
        soulboundCreditScore.address
      );
      expect(price).to.be.equal(10);

      // set allowance for soul store
      const masa: ERC20 = ERC20__factory.connect(MASA_GOERLI, owner);
      await masa.connect(dataReader).approve(soulLinker.address, price);

      await soulLinker
        .connect(dataReader)
        .addPermission(
          MASA_GOERLI,
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
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
        expirationDate: expirationDateInfo,
        isRevoked: isRevokedInfo
      } = await soulLinker.getPermissionInfo(
        soulboundCreditScore.address,
        creditScore1,
        readerIdentityId,
        signatureDate
      );
      expect(ownerIdentityIdInfo).to.be.equal(ownerIdentityId);
      expect(expirationDateInfo).to.be.equal(expirationDate);
      expect(isRevokedInfo).to.be.equal(false);

      const valid = await soulLinker
        .connect(dataReader)
        .validatePermission(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      expect(valid).to.be.true;
    });

    it("addPermission must work paying with ETH", async () => {
      const signature = await signLink(
        readerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      const price = await soulLinker.getPriceForAddPermission(
        ethers.constants.AddressZero,
        soulboundCreditScore.address
      );

      await soulLinker
        .connect(dataReader)
        .addPermission(
          ethers.constants.AddressZero,
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate,
          expirationDate,
          signature,
          { value: price }
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
        expirationDate: expirationDateInfo,
        isRevoked: isRevokedInfo
      } = await soulLinker.getPermissionInfo(
        soulboundCreditScore.address,
        creditScore1,
        readerIdentityId,
        signatureDate
      );
      expect(ownerIdentityIdInfo).to.be.equal(ownerIdentityId);
      expect(expirationDateInfo).to.be.equal(expirationDate);
      expect(isRevokedInfo).to.be.equal(false);

      const valid = await soulLinker
        .connect(dataReader)
        .validatePermission(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      expect(valid).to.be.true;
    });

    it("addPermission won't work with an invalid signature", async () => {
      const signature = await signLink(
        ownerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      const price = await soulLinker.getPriceForAddPermission(
        MASA_GOERLI,
        soulboundCreditScore.address
      );

      // set allowance for soul store
      const masa: ERC20 = ERC20__factory.connect(MASA_GOERLI, owner);
      await masa.connect(dataReader).approve(soulLinker.address, price);

      await expect(
        soulLinker
          .connect(dataReader)
          .addPermission(
            MASA_GOERLI,
            readerIdentityId,
            ownerIdentityId,
            soulboundCreditScore.address,
            creditScore1,
            signatureDate,
            expirationDate,
            signature
          )
      ).to.be.rejected;

      await expect(
        soulLinker
          .connect(dataReader)
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

      const price = await soulLinker.getPriceForAddPermission(
        MASA_GOERLI,
        soulboundCreditScore.address
      );

      // set allowance for soul store
      const masa: ERC20 = ERC20__factory.connect(MASA_GOERLI, owner);
      await masa.connect(dataReader).approve(soulLinker.address, price);

      await soulLinker
        .connect(dataReader)
        .addPermission(
          MASA_GOERLI,
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate,
          expirationDate,
          signature
        );

      await expect(
        soulLinker
          .connect(dataReader)
          .revokePermission(
            readerIdentityId,
            ownerIdentityId,
            soulboundCreditScore.address,
            creditScore1,
            signatureDate
          )
      ).to.be.rejected;

      const valid = await soulLinker
        .connect(dataReader)
        .validatePermission(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      expect(valid).to.be.true;
    });

    it("owner of data can call revokePermission", async () => {
      const signature = await signLink(
        readerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      const price = await soulLinker.getPriceForAddPermission(
        MASA_GOERLI,
        soulboundCreditScore.address
      );

      // set allowance for soul store
      const masa: ERC20 = ERC20__factory.connect(MASA_GOERLI, owner);
      await masa.connect(dataReader).approve(soulLinker.address, price);

      await soulLinker
        .connect(dataReader)
        .addPermission(
          MASA_GOERLI,
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate,
          expirationDate,
          signature
        );

      const valid = await soulLinker
        .connect(dataReader)
        .validatePermission(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      expect(valid).to.be.true;

      await soulLinker
        .connect(dataOwner)
        .revokePermission(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      await expect(
        soulLinker
          .connect(dataReader)
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
