import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { deployments, ethers, getChainId } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  IERC20,
  IERC20__factory,
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

    it("should set mintPrice from owner", async () => {
      const newPrice = 100;
      await soulboundCreditScore.connect(owner).setMintPrice(newPrice);

      expect(await soulboundCreditScore.mintPrice()).to.be.equal(newPrice);
    });

    it("should fail to set mintPrice from non owner", async () => {
      const newPrice = 100;
      await expect(soulboundCreditScore.connect(someone).setMintPrice(newPrice))
        .to.be.rejected;
    });

    it("should set mintPriceMASA from owner", async () => {
      const newPrice = 100;
      await soulboundCreditScore.connect(owner).setMintPriceMASA(newPrice);

      expect(await soulboundCreditScore.mintPriceMASA()).to.be.equal(newPrice);
    });

    it("should fail to set mintPriceMASA from non owner", async () => {
      const newPrice = 100;
      await expect(
        soulboundCreditScore.connect(someone).setMintPriceMASA(newPrice)
      ).to.be.rejected;
    });

    it("should set addLinkPrice from owner", async () => {
      const newPrice = 100;
      await soulboundCreditScore.connect(owner).setAddLinkPrice(newPrice);

      expect(await soulboundCreditScore.addLinkPrice()).to.be.equal(newPrice);
    });

    it("should fail to set addLinkPrice from non owner", async () => {
      const newPrice = 100;
      await expect(
        soulboundCreditScore.connect(someone).setAddLinkPrice(newPrice)
      ).to.be.rejected;
    });

    it("should set addLinkPriceMASA from owner", async () => {
      const newPrice = 100;
      await soulboundCreditScore.connect(owner).setAddLinkPriceMASA(newPrice);

      expect(await soulboundCreditScore.addLinkPriceMASA()).to.be.equal(
        newPrice
      );
    });

    it("should fail to set addLinkPriceMASA from non owner", async () => {
      const newPrice = 100;
      await expect(
        soulboundCreditScore.connect(someone).setAddLinkPriceMASA(newPrice)
      ).to.be.rejected;
    });

    it("should set queryLinkPrice from owner", async () => {
      const newPrice = 100;
      await soulboundCreditScore.connect(owner).setQueryLinkPrice(newPrice);

      expect(await soulboundCreditScore.queryLinkPrice()).to.be.equal(newPrice);
    });

    it("should fail to set queryLinkPrice from non owner", async () => {
      const newPrice = 100;
      await expect(
        soulboundCreditScore.connect(someone).setQueryLinkPrice(newPrice)
      ).to.be.rejected;
    });

    it("should set queryLinkPriceMASA from owner", async () => {
      const newPrice = 100;
      await soulboundCreditScore.connect(owner).setQueryLinkPriceMASA(newPrice);

      expect(await soulboundCreditScore.queryLinkPriceMASA()).to.be.equal(
        newPrice
      );
    });

    it("should fail to set queryLinkPriceMASA from non owner", async () => {
      const newPrice = 100;
      await expect(
        soulboundCreditScore.connect(someone).setQueryLinkPriceMASA(newPrice)
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

  describe("addLink", () => {
    it("addLink must work with a valid signature", async () => {
      const signature = await signLink(
        readerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      await soulLinker
        .connect(dataReader)
        .addLink(
          MASA_GOERLI,
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate,
          expirationDate,
          signature
        );

      const permissionSignatureDates = await soulLinker.getLinkSignatureDates(
        soulboundCreditScore.address,
        creditScore1,
        readerIdentityId
      );
      expect(permissionSignatureDates[0]).to.be.equal(signatureDate);

      const links = await soulLinker.getLinks(
        soulboundCreditScore.address,
        creditScore1
      );
      expect(links[0].readerIdentityId).to.be.equal(readerIdentityId);
      expect(links[0].signatureDate).to.be.equal(signatureDate);

      const {
        ownerIdentityId: ownerIdentityIdInfo,
        expirationDate: expirationDateInfo,
        isRevoked: isRevokedInfo
      } = await soulLinker.getLinkInfo(
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
        .validateLink(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      expect(valid).to.be.true;
    });

    it("addLink must work paying with MASA without an exchange rate", async () => {
      await soulboundCreditScore.connect(owner).setAddLinkPriceMASA(10);
      expect(await soulboundCreditScore.addLinkPriceMASA()).to.be.equal(10);

      const signature = await signLink(
        readerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      const price = await soulLinker.getPriceForAddLink(
        MASA_GOERLI,
        soulboundCreditScore.address
      );
      expect(price).to.be.equal(10);

      // set allowance for soul store
      const masa: IERC20 = IERC20__factory.connect(MASA_GOERLI, owner);
      await masa.connect(dataReader).approve(soulLinker.address, price);

      await soulLinker
        .connect(dataReader)
        .addLink(
          MASA_GOERLI,
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate,
          expirationDate,
          signature
        );

      const permissionSignatureDates = await soulLinker.getLinkSignatureDates(
        soulboundCreditScore.address,
        creditScore1,
        readerIdentityId
      );
      expect(permissionSignatureDates[0]).to.be.equal(signatureDate);

      const links = await soulLinker.getLinks(
        soulboundCreditScore.address,
        creditScore1
      );
      expect(links[0].readerIdentityId).to.be.equal(readerIdentityId);
      expect(links[0].signatureDate).to.be.equal(signatureDate);

      const {
        ownerIdentityId: ownerIdentityIdInfo,
        expirationDate: expirationDateInfo,
        isRevoked: isRevokedInfo
      } = await soulLinker.getLinkInfo(
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
        .validateLink(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      expect(valid).to.be.true;
    });

    it("addLink must work paying with ETH", async () => {
      await soulboundCreditScore.connect(owner).setAddLinkPrice(10);
      expect(await soulboundCreditScore.addLinkPrice()).to.be.equal(10);

      const signature = await signLink(
        readerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      const price = await soulLinker.getPriceForAddLink(
        ethers.constants.AddressZero,
        soulboundCreditScore.address
      );

      await soulLinker
        .connect(dataReader)
        .addLink(
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

      const permissionSignatureDates = await soulLinker.getLinkSignatureDates(
        soulboundCreditScore.address,
        creditScore1,
        readerIdentityId
      );
      expect(permissionSignatureDates[0]).to.be.equal(signatureDate);

      const links = await soulLinker.getLinks(
        soulboundCreditScore.address,
        creditScore1
      );
      expect(links[0].readerIdentityId).to.be.equal(readerIdentityId);
      expect(links[0].signatureDate).to.be.equal(signatureDate);

      const {
        ownerIdentityId: ownerIdentityIdInfo,
        expirationDate: expirationDateInfo,
        isRevoked: isRevokedInfo
      } = await soulLinker.getLinkInfo(
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
        .validateLink(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      expect(valid).to.be.true;
    });

    it("addLink won't work with an invalid signature", async () => {
      const signature = await signLink(
        ownerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      await expect(
        soulLinker
          .connect(dataReader)
          .addLink(
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
          .validateLink(
            readerIdentityId,
            ownerIdentityId,
            soulboundCreditScore.address,
            creditScore1,
            signatureDate
          )
      ).to.be.rejected;
    });
  });

  describe("revokeLink", () => {
    it("non owner of data can't call revokeLink", async () => {
      const signature = await signLink(
        readerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      await soulLinker
        .connect(dataReader)
        .addLink(
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
          .revokeLink(
            readerIdentityId,
            ownerIdentityId,
            soulboundCreditScore.address,
            creditScore1,
            signatureDate
          )
      ).to.be.rejected;

      const valid = await soulLinker
        .connect(dataReader)
        .validateLink(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      expect(valid).to.be.true;
    });

    it("owner of data can call revokeLink", async () => {
      const signature = await signLink(
        readerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      await soulLinker
        .connect(dataReader)
        .addLink(
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
        .validateLink(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      expect(valid).to.be.true;

      await soulLinker
        .connect(dataOwner)
        .revokeLink(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      await expect(
        soulLinker
          .connect(dataReader)
          .validateLink(
            readerIdentityId,
            ownerIdentityId,
            soulboundCreditScore.address,
            creditScore1,
            signatureDate
          )
      ).to.be.rejected;
    });

    it("owner of data can call revokeLink to a link that still doesn't exist", async () => {
      await soulLinker
        .connect(dataOwner)
        .revokeLink(
          readerIdentityId,
          ownerIdentityId,
          soulboundCreditScore.address,
          creditScore1,
          signatureDate
        );

      const signature = await signLink(
        readerIdentityId,
        ownerIdentityId,
        soulboundCreditScore.address,
        creditScore1
      );

      await expect(
        soulLinker
          .connect(dataReader)
          .addLink(
            MASA_GOERLI,
            readerIdentityId,
            ownerIdentityId,
            soulboundCreditScore.address,
            creditScore1,
            signatureDate,
            expirationDate,
            signature
          )
      ).to.be.rejectedWith("LinkAlreadyExists");

      await expect(
        soulLinker
          .connect(dataReader)
          .validateLink(
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
