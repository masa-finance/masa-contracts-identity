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
  SoulboundIdentity__factory
} from "../typechain";
import {
  MASA_GOERLI,
  SWAPROUTER_GOERLI,
  USDC_GOERLI,
  WETH_GOERLI
} from "../src/constants";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulboundIdentity: SoulboundIdentity;
let soulboundCreditScore: SoulboundCreditScore;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let authority: SignerWithAddress;

let identityId1: number;

const signatureDate = Math.floor(Date.now() / 1000);

let signature: string;

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

describe("Soulbound Credit Score", () => {
  before(async () => {
    [, owner, address1, authority] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulboundCreditScore", {
      fallbackToGlobal: false
    });

    const { address: soulboundIdentityAddress } = await deployments.get(
      "SoulboundIdentity"
    );
    const { address: soulboundCreditScoreAddress } = await deployments.get(
      "SoulboundCreditScore"
    );

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );
    soulboundCreditScore = SoulboundCreditScore__factory.connect(
      soulboundCreditScoreAddress,
      owner
    );
    const uniswapRouter: IUniswapRouter = IUniswapRouter__factory.connect(
      SWAPROUTER_GOERLI,
      owner
    );

    // we get stable coins for address1
    await uniswapRouter.swapExactETHForTokens(
      0,
      [WETH_GOERLI, USDC_GOERLI],
      address1.address,
      Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
      {
        value: ethers.utils.parseEther("10")
      }
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
    await soulboundCreditScore
      .connect(owner)
      .enablePaymentMethod(ethers.constants.AddressZero);
    await soulboundCreditScore.connect(owner).enablePaymentMethod(USDC_GOERLI);
    await soulboundCreditScore.connect(owner).enablePaymentMethod(MASA_GOERLI);

    // we mint identity SBT
    const mintTx = await soulboundIdentity
      .connect(owner)
      .mint(address1.address);
    const mintReceipt = await mintTx.wait();

    identityId1 = mintReceipt.events![0].args![1].toNumber();

    // we add authority account
    await soulboundCreditScore.addAuthority(authority.address);

    signature = await signMintCreditScore(identityId1, authority);
  });

  describe("owner functions", () => {
    it("should set SoulboundIdentity from owner", async () => {
      await soulboundCreditScore
        .connect(owner)
        .setSoulboundIdentity(address1.address);

      expect(await soulboundCreditScore.soulboundIdentity()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set SoulboundIdentity from non owner", async () => {
      await expect(
        soulboundCreditScore
          .connect(address1)
          .setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });
  });

  describe("sbt information", () => {
    it("should be able to get sbt information", async () => {
      expect(await soulboundCreditScore.name()).to.equal("Masa Credit Score");

      expect(await soulboundCreditScore.symbol()).to.equal("MCS");
    });
  });

  describe("mint", () => {
    it("should fail to mint from owner address", async () => {
      await expect(
        soulboundCreditScore
          .connect(owner)
          ["mint(address,address,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            address1.address,
            authority.address,
            signatureDate,
            signature
          )
      ).to.be.revertedWith("CallerNotOwner");
    });

    it("should fail to mint from owner identity", async () => {
      await expect(
        soulboundCreditScore
          .connect(owner)
          ["mint(address,uint256,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            identityId1,
            authority.address,
            signatureDate,
            signature
          )
      ).to.be.revertedWith("CallerNotOwner");
    });

    it("should mint twice", async () => {
      await soulboundCreditScore
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signature
        );
      await expect(
        soulboundCreditScore
          .connect(address1)
          ["mint(address,address,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            address1.address,
            authority.address,
            signatureDate,
            signature
          )
      ).to.be.revertedWith("CreditScoreAlreadyCreated");

      expect(await soulboundCreditScore.totalSupply()).to.equal(1);
      expect(await soulboundCreditScore.tokenByIndex(0)).to.equal(0);
    });

    it("should mint from final user address", async () => {
      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signature
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );
    });

    it("should mint from final user identity", async () => {
      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,uint256,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          identityId1,
          authority.address,
          signatureDate,
          signature
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );
    });

    it("should fail to mint with non-authority signature", async () => {
      const signatureNonAuthority = await signMintCreditScore(
        identityId1,
        address1
      );

      await expect(
        soulboundCreditScore
          .connect(address1)
          ["mint(address,uint256,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            identityId1,
            address1.address,
            signatureDate,
            signatureNonAuthority
          )
      ).to.be.revertedWith("NotAuthorized");
    });

    it("should fail to mint with invalid signature", async () => {
      const signatureNonAuthority = await signMintCreditScore(
        identityId1,
        address1
      );

      await expect(
        soulboundCreditScore
          .connect(address1)
          ["mint(address,uint256,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            identityId1,
            authority.address,
            signatureDate,
            signatureNonAuthority
          )
      ).to.be.revertedWith("InvalidSignature");
    });
  });

  describe("mint paying a minting fee", () => {
    beforeEach(async () => {
      await soulboundCreditScore.connect(owner).setMintPrice(1); // 1 USD
    });

    it("should mint from final user address paying with ETH", async () => {
      const reserveWallet = await soulboundCreditScore.reserveWallet();
      const priceInETH = await soulboundCreditScore.getMintPrice(
        ethers.constants.AddressZero
      );
      const reserveWalletBalanceBefore = await ethers.provider.getBalance(
        reserveWallet
      );

      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signature,
          { value: priceInETH }
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );

      const reserveWalletBalanceAfter = await ethers.provider.getBalance(
        reserveWallet
      );

      // we check that the reserve wallet received the ETH
      expect(
        reserveWalletBalanceAfter.sub(reserveWalletBalanceBefore)
      ).to.be.equal(priceInETH);
    });

    it("should mint from final user identity paying with ETH", async () => {
      const reserveWallet = await soulboundCreditScore.reserveWallet();
      const priceInETH = await soulboundCreditScore.getMintPrice(
        ethers.constants.AddressZero
      );
      const reserveWalletBalanceBefore = await ethers.provider.getBalance(
        reserveWallet
      );

      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,uint256,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          identityId1,
          authority.address,
          signatureDate,
          signature,
          { value: priceInETH }
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );

      const reserveWalletBalanceAfter = await ethers.provider.getBalance(
        reserveWallet
      );

      // we check that the reserve wallet received the ETH
      expect(
        reserveWalletBalanceAfter.sub(reserveWalletBalanceBefore)
      ).to.be.equal(priceInETH);
    });

    it("should mint from final user identity paying with stable coin", async () => {
      const priceInStableCoin = await soulboundCreditScore.getMintPrice(
        USDC_GOERLI
      );

      // set allowance for soul store
      const usdc: ERC20 = ERC20__factory.connect(USDC_GOERLI, owner);
      await usdc
        .connect(address1)
        .approve(soulboundCreditScore.address, priceInStableCoin);

      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,uint256,address,uint256,bytes)"](
          USDC_GOERLI,
          identityId1,
          authority.address,
          signatureDate,
          signature
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![1].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );
    });

    it("should mint from final user identity paying with MASA coin", async () => {
      const priceInStableCoin = await soulboundCreditScore.getMintPrice(
        MASA_GOERLI
      );

      // set allowance for soul store
      const usdc: ERC20 = ERC20__factory.connect(MASA_GOERLI, owner);
      await usdc
        .connect(address1)
        .approve(soulboundCreditScore.address, priceInStableCoin);

      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,uint256,address,uint256,bytes)"](
          MASA_GOERLI,
          identityId1,
          authority.address,
          signatureDate,
          signature
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![2].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );
    });

    it("should fail to get minting info for invalid payment method", async () => {
      await expect(
        soulboundCreditScore.getMintPrice(owner.address)
      ).to.be.rejectedWith("InvalidPaymentMethod");
    });

    it("we can't use an invalid payment method", async () => {
      await expect(
        soulboundCreditScore
          .connect(address1)
          ["mint(address,uint256,address,uint256,bytes)"](
            address1.address, // invalid payment method
            identityId1,
            authority.address,
            signatureDate,
            signature
          )
      ).to.be.rejectedWith("InvalidPaymentMethod");
    });
  });

  describe("burn", () => {
    it("should burn", async () => {
      // we mint
      let mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signature
        );
      let mintReceipt = await mintTx.wait();
      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(
        await soulboundCreditScore.balanceOf(address1.address)
      ).to.be.equal(1);
      expect(
        await soulboundCreditScore["ownerOf(uint256)"](tokenId)
      ).to.be.equal(address1.address);

      await soulboundCreditScore.connect(address1).burn(tokenId);

      expect(
        await soulboundCreditScore.balanceOf(address1.address)
      ).to.be.equal(0);
    });
  });

  describe("tokenUri", () => {
    it("should get a valid token URI from its tokenId", async () => {
      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signature
        );

      const mintReceipt = await mintTx.wait();
      const tokenId = mintReceipt.events![0].args![1].toNumber();
      const tokenUri = await soulboundCreditScore.tokenURI(tokenId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/credit-score/");
    });
  });
});
