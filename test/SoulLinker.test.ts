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
  SoulName,
  SoulName__factory,
  SoulLinker,
  SoulLinker__factory
} from "../typechain";
import { getEnvParams } from "../src/EnvParams";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

const env = getEnvParams("hardhat");

const SOUL_NAME1 = "soulNameTest1";
const SOUL_NAME2 = "soulNameTest2";
const SOUL_NAME3 = "soulNameTest3";
const YEAR = 1; // 1 year
const ARWEAVE_LINK1 = "ar://jK9sR4OrYvODj7PD3czIAyNJalub0-vdV_JAg1NqQ-o";
const ARWEAVE_LINK2 = "ar://2Ohog_ya_61nTJlKox43L4ZQzZ9DGRao8NU6WZRxs8";

// contract instances
let soulboundIdentity: SoulboundIdentity;
let soulboundCreditScore: SoulboundCreditScore;
let soulLinker: SoulLinker;
let soulName: SoulName;
let soulName2: SoulName;

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

const { deploy } = deployments;

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

const signMint = async (
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
    await deployments.fixture("SoulName", { fallbackToGlobal: false });
    await deployments.fixture("SoulboundCreditScore", {
      fallbackToGlobal: false
    });
    await deployments.fixture("SoulLinker", { fallbackToGlobal: false });

    const { address: soulboundIdentityAddress } =
      await deployments.get("SoulboundIdentity");
    const { address: soulNameAddress } = await deployments.get("SoulName");
    const { address: soulboundCreditScoreAddress } = await deployments.get(
      "SoulboundCreditScore"
    );
    const { address: soulLinkerAddress } = await deployments.get("SoulLinker");

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );
    soulName = SoulName__factory.connect(soulNameAddress, owner);
    soulboundCreditScore = SoulboundCreditScore__factory.connect(
      soulboundCreditScoreAddress,
      owner
    );
    soulLinker = SoulLinker__factory.connect(soulLinkerAddress, owner);

    // we deploy a second SoulName contract
    const soulNameDepl = await deploy("SoulName", {
      from: owner.address,
      args: [
        owner.address,
        "Name",
        "SYM",
        soulboundIdentityAddress,
        ".test",
        "https://test.com"
      ]
    });
    soulName2 = SoulName__factory.connect(soulNameDepl.address, owner);

    // we mint identity SBT for dataOwner
    let mintTx = await soulboundIdentity
      .connect(owner)
      ["mint(address)"](dataOwner.address);
    let mintReceipt = await mintTx.wait();

    ownerIdentityId = mintReceipt.events![0].args![1].toNumber();

    // we mint identity SBT for dataReader
    mintTx = await soulboundIdentity
      .connect(owner)
      ["mint(address)"](dataReader.address);
    mintReceipt = await mintTx.wait();

    readerIdentityId = mintReceipt.events![0].args![1].toNumber();

    // we add authority account
    await soulboundCreditScore.addAuthority(authority.address);

    await soulboundCreditScore.setMintPrice(0); // 0 USDC

    // we mint credit score SBT for dataOwner
    const signatureMint = await signMint(ownerIdentityId, authority);

    mintTx = await soulboundCreditScore
      .connect(dataOwner)
      [
        "mint(address,uint256,address,uint256,bytes)"
      ](ethers.constants.AddressZero, ownerIdentityId, authority.address, signatureDate, signatureMint);
    mintReceipt = await mintTx.wait();

    creditScore1 = mintReceipt.events![0].args![1].toNumber();

    const uniswapRouter: IUniswapRouter = IUniswapRouter__factory.connect(
      env.SWAP_ROUTER,
      owner
    );

    // we get MASA utility tokens for dataReader
    await uniswapRouter.swapExactETHForTokens(
      0,
      [env.WETH_TOKEN, env.MASA_TOKEN],
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

    it("should set projectFeeReceiver from owner", async () => {
      await soulLinker.connect(owner).setProjectFeeReceiver(someone.address);

      expect(await soulLinker.projectFeeReceiver()).to.be.equal(
        someone.address
      );
    });

    it("should fail to set projectFeeReceiver from non owner", async () => {
      await expect(
        soulLinker.connect(someone).setProjectFeeReceiver(someone.address)
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
      const sbtConnections = await soulLinker[
        "getSBTConnections(uint256,address)"
      ](ownerIdentityId, soulboundCreditScore.address);
      expect(sbtConnections.length).to.be.equal(1);
      expect(sbtConnections[0]).to.be.equal(creditScore1);
    });

    it("should get SBT connections by owner address", async () => {
      const sbtConnections = await soulLinker[
        "getSBTConnections(address,address)"
      ](dataOwner.address, soulboundCreditScore.address);
      expect(sbtConnections.length).to.be.equal(1);
      expect(sbtConnections[0]).to.be.equal(creditScore1);
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
          env.MASA_TOKEN,
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

      const readerLinks = await soulLinker.getReaderLinks(readerIdentityId);
      expect(readerLinks[0].token).to.be.equal(soulboundCreditScore.address);
      expect(readerLinks[0].tokenId).to.be.equal(creditScore1);
      expect(readerLinks[0].signatureDate).to.be.equal(signatureDate);

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

      const { price } = await soulLinker.getPriceForAddLinkWithProtocolFee(
        env.MASA_TOKEN,
        soulboundCreditScore.address
      );
      expect(price).to.be.equal(10);

      // set allowance for soul store
      const masa: IERC20 = IERC20__factory.connect(env.MASA_TOKEN, owner);
      await masa.connect(dataReader).approve(soulLinker.address, price);

      await soulLinker
        .connect(dataReader)
        .addLink(
          env.MASA_TOKEN,
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

      const readerLinks = await soulLinker.getReaderLinks(readerIdentityId);
      expect(readerLinks[0].token).to.be.equal(soulboundCreditScore.address);
      expect(readerLinks[0].tokenId).to.be.equal(creditScore1);
      expect(readerLinks[0].signatureDate).to.be.equal(signatureDate);

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

      const { price } = await soulLinker.getPriceForAddLinkWithProtocolFee(
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

      const readerLinks = await soulLinker.getReaderLinks(readerIdentityId);
      expect(readerLinks[0].token).to.be.equal(soulboundCreditScore.address);
      expect(readerLinks[0].tokenId).to.be.equal(creditScore1);
      expect(readerLinks[0].signatureDate).to.be.equal(signatureDate);

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
            env.MASA_TOKEN,
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
          env.MASA_TOKEN,
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
          env.MASA_TOKEN,
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
            env.MASA_TOKEN,
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

  describe("set a default SoulName", () => {
    let nameId2;
    let nameId3;

    beforeEach(async () => {
      // mint a second name with the first soul name
      await soulName
        .connect(owner)
        ["mint(address,string,uint256,string)"](
          dataOwner.address,
          SOUL_NAME1,
          YEAR,
          ARWEAVE_LINK1
        );

      const mintTx = await soulName
        .connect(owner)
        ["mint(address,string,uint256,string)"](
          dataOwner.address,
          SOUL_NAME2,
          YEAR,
          ARWEAVE_LINK2
        );
      const mintReceipt = await mintTx.wait();

      nameId2 = mintReceipt.events![0].args![2].toNumber();

      // mint a third name with the second soul name
      const mintTx2 = await soulName2
        .connect(owner)
        ["mint(address,string,uint256,string)"](
          dataOwner.address,
          SOUL_NAME3,
          YEAR,
          ARWEAVE_LINK2
        );
      const mintReceipt2 = await mintTx2.wait();

      nameId3 = mintReceipt2.events![0].args![2].toNumber();
    });

    it("should add SoulName from owner", async () => {
      await soulLinker.connect(owner).addSoulName(soulName2.address);

      expect(await soulLinker.isSoulName(soulName2.address)).to.be.true;
    });

    it("should fail to add SoulName from non owner", async () => {
      await expect(soulLinker.connect(someone).addSoulName(soulName2.address))
        .to.be.rejected;
    });

    it("should remove SoulName from owner", async () => {
      await soulLinker.connect(owner).removeSoulName(soulName.address);

      expect(await soulLinker.isSoulName(soulName.address)).to.be.false;
    });

    it("should fail to remove SoulName from non owner", async () => {
      await expect(soulLinker.connect(someone).removeSoulName(soulName.address))
        .to.be.rejected;
    });

    it("only owner of the name can set a default SoulName", async () => {
      await expect(
        soulLinker.connect(owner).setDefaultSoulName(soulName.address, nameId2)
      ).to.be.rejected;
    });

    it("we can't set a default soul name of a non registered SoulName token", async () => {
      await expect(
        soulLinker
          .connect(dataOwner)
          .setDefaultSoulName(soulName2.address, nameId3)
      ).to.be.rejectedWith("SoulNameNotRegistered");
    });

    it("getSoulNames(uint256) returns array of SBT names with the default name", async () => {
      expect(
        (await soulLinker["getSoulNames(uint256)"](ownerIdentityId)).names
      ).to.deep.equal([SOUL_NAME1.toLowerCase(), SOUL_NAME2.toLowerCase()]);

      expect((await soulLinker.defaultSoulName(dataOwner.address)).exists).to.be
        .false;

      // we set the second name as default
      await soulLinker
        .connect(dataOwner)
        .setDefaultSoulName(soulName.address, nameId2);

      expect(
        (await soulLinker["getSoulNames(uint256)"](ownerIdentityId)).names
      ).to.deep.equal([SOUL_NAME1.toLowerCase(), SOUL_NAME2.toLowerCase()]);
      expect(
        (await soulLinker["getSoulNames(uint256)"](ownerIdentityId)).defaultName
      ).to.deep.equal(SOUL_NAME2);

      expect((await soulLinker.defaultSoulName(dataOwner.address)).exists).to.be
        .true;
      expect(
        (await soulLinker.defaultSoulName(dataOwner.address)).tokenId
      ).to.be.equal(nameId2);
    });

    it("getSoulNames(address) returns array of SBT names with the default name", async () => {
      expect(
        (await soulLinker["getSoulNames(address)"](dataOwner.address)).names
      ).to.deep.equal([SOUL_NAME1.toLowerCase(), SOUL_NAME2.toLowerCase()]);

      expect((await soulLinker.defaultSoulName(dataOwner.address)).exists).to.be
        .false;

      // we set the second name as default
      await soulLinker
        .connect(dataOwner)
        .setDefaultSoulName(soulName.address, nameId2);

      expect(
        (await soulLinker["getSoulNames(uint256)"](ownerIdentityId)).names
      ).to.deep.equal([SOUL_NAME1.toLowerCase(), SOUL_NAME2.toLowerCase()]);
      expect(
        (await soulLinker["getSoulNames(uint256)"](ownerIdentityId)).defaultName
      ).to.deep.equal(SOUL_NAME2);

      expect((await soulLinker.defaultSoulName(dataOwner.address)).exists).to.be
        .true;
      expect(
        (await soulLinker.defaultSoulName(dataOwner.address)).tokenId
      ).to.be.equal(nameId2);
    });

    it("getSoulNames() using a second registered SoulName", async () => {
      await soulLinker.connect(owner).addSoulName(soulName2.address);

      // we set the third name as default
      await soulLinker
        .connect(dataOwner)
        .setDefaultSoulName(soulName2.address, nameId3);

      expect(
        (await soulLinker["getSoulNames(uint256)"](ownerIdentityId)).names
      ).to.deep.equal([
        SOUL_NAME1.toLowerCase(),
        SOUL_NAME2.toLowerCase(),
        SOUL_NAME3.toLowerCase()
      ]);
      expect(
        (await soulLinker["getSoulNames(uint256)"](ownerIdentityId)).defaultName
      ).to.deep.equal(SOUL_NAME3);

      expect((await soulLinker.defaultSoulName(dataOwner.address)).exists).to.be
        .true;
      expect(
        (await soulLinker.defaultSoulName(dataOwner.address)).tokenId
      ).to.be.equal(nameId3);
    });
  });
});
