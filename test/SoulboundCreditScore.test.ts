import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments, getChainId } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  IERC20,
  IERC20__factory,
  IUniswapRouter,
  IUniswapRouter__factory,
  SoulboundCreditScore,
  SoulboundCreditScore__factory,
  SoulboundIdentity,
  SoulboundIdentity__factory
} from "../typechain";
import { getEnvParams } from "../src/EnvParams";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

const env = getEnvParams("hardhat");

// contract instances
let soulboundIdentity: SoulboundIdentity;
let soulboundCreditScore: SoulboundCreditScore;

let owner: SignerWithAddress;
let protocolWallet: SignerWithAddress;
let address1: SignerWithAddress;
let authority: SignerWithAddress;
let projectWallet: SignerWithAddress;

let identityId1: number;

const signatureDate = Math.floor(Date.now() / 1000);

let signatureToIdentity: string;
let signatureToAddress: string;

const signMintCreditScoreToIdentity = async (
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

const signMintCreditScoreToAddress = async (
  to: string,
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
        { name: "to", type: "address" },
        { name: "authorityAddress", type: "address" },
        { name: "signatureDate", type: "uint256" }
      ]
    },
    // Value
    {
      to: to,
      authorityAddress: authoritySigner.address,
      signatureDate: signatureDate
    }
  );

  return signature;
};

describe("Soulbound Credit Score", () => {
  before(async () => {
    [, owner, protocolWallet, address1, authority, projectWallet] =
      await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulboundCreditScore", {
      fallbackToGlobal: false
    });

    const { address: soulboundIdentityAddress } =
      await deployments.get("SoulboundIdentity");
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
      env.SWAP_ROUTER,
      owner
    );

    // we get stable coins for address1
    await uniswapRouter.swapExactETHForTokens(
      0,
      [env.WETH_TOKEN, env.USDC_TOKEN],
      address1.address,
      Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
      {
        value: ethers.utils.parseEther("10")
      }
    );

    // we get MASA utility tokens for address1
    await uniswapRouter.swapExactETHForTokens(
      0,
      [env.WETH_TOKEN, env.MASA_TOKEN],
      address1.address,
      Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
      {
        value: ethers.utils.parseEther("10")
      }
    );

    // we mint identity SBT
    const mintTx = await soulboundIdentity
      .connect(owner)
      ["mint(address)"](address1.address);
    const mintReceipt = await mintTx.wait();

    identityId1 = mintReceipt.events![0].args![1].toNumber();

    // we add authority account
    await soulboundCreditScore.addAuthority(authority.address);

    await soulboundCreditScore.setMintPrice(0); // 0 USDC

    signatureToIdentity = await signMintCreditScoreToIdentity(
      identityId1,
      authority
    );
    signatureToAddress = await signMintCreditScoreToAddress(
      address1.address,
      authority
    );
  });

  describe("owner and project admin functions", () => {
    beforeEach(async () => {
      const PROJECT_ADMIN_ROLE =
        await soulboundCreditScore.PROJECT_ADMIN_ROLE();

      await soulboundCreditScore
        .connect(owner)
        .grantRole(PROJECT_ADMIN_ROLE, projectWallet.address);
    });

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

    it("should add authority from owner", async () => {
      await soulboundCreditScore.connect(owner).addAuthority(address1.address);

      expect(await soulboundCreditScore.authorities(address1.address)).to.be
        .true;
    });

    it("should add authority from project admin", async () => {
      await soulboundCreditScore
        .connect(projectWallet)
        .addAuthority(address1.address);

      expect(await soulboundCreditScore.authorities(address1.address)).to.be
        .true;
    });

    it("should fail to add authority from non owner", async () => {
      await expect(
        soulboundCreditScore.connect(address1).addAuthority(address1.address)
      ).to.be.rejected;
    });

    it("should remove authority from owner", async () => {
      await soulboundCreditScore
        .connect(owner)
        .removeAuthority(authority.address);

      expect(await soulboundCreditScore.authorities(authority.address)).to.be
        .false;
    });

    it("should remove authority from project admin", async () => {
      await soulboundCreditScore
        .connect(projectWallet)
        .removeAuthority(authority.address);

      expect(await soulboundCreditScore.authorities(authority.address)).to.be
        .false;
    });

    it("should fail to remove authority from non owner", async () => {
      await expect(
        soulboundCreditScore
          .connect(address1)
          .removeAuthority(authority.address)
      ).to.be.rejected;
    });

    it("should set mint price from owner", async () => {
      await soulboundCreditScore.connect(owner).setMintPrice(2_000_000);

      expect(await soulboundCreditScore.mintPrice()).to.be.equal(2_000_000);
    });

    it("should set mint price from project admin", async () => {
      await soulboundCreditScore.connect(projectWallet).setMintPrice(2_000_000);

      expect(await soulboundCreditScore.mintPrice()).to.be.equal(2_000_000);
    });

    it("should fail to set mint price from non owner", async () => {
      await expect(
        soulboundCreditScore.connect(address1).setMintPrice(2_000_000)
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
            signatureToAddress
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
            signatureToIdentity
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
          signatureToAddress
        );
      await expect(
        soulboundCreditScore
          .connect(address1)
          ["mint(address,address,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            address1.address,
            authority.address,
            signatureDate,
            signatureToAddress
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
          signatureToAddress
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
          signatureToIdentity
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );
    });

    it("should fail to mint with non-authority signature", async () => {
      const signatureNonAuthority = await signMintCreditScoreToIdentity(
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
      const signatureNonAuthority = await signMintCreditScoreToIdentity(
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
      await soulboundCreditScore.connect(owner).setMintPrice(10_000_000); // 10 USD
    });

    it("should mint from final user address paying with ETH", async () => {
      const projectFeeReceiver =
        await soulboundCreditScore.projectFeeReceiver();
      const { price } = await soulboundCreditScore.getMintPriceWithProtocolFee(
        ethers.constants.AddressZero
      );
      const projectFeeWalletBalanceBefore =
        await ethers.provider.getBalance(projectFeeReceiver);

      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress,
          { value: price }
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );

      const projectFeeWalletBalanceAfter =
        await ethers.provider.getBalance(projectFeeReceiver);

      // we check that the project fee wallet received the ETH
      expect(
        projectFeeWalletBalanceAfter.sub(projectFeeWalletBalanceBefore)
      ).to.be.equal(price);
    });

    it("should mint from final user identity paying with ETH", async () => {
      const projectFeeReceiver =
        await soulboundCreditScore.projectFeeReceiver();
      const { price } = await soulboundCreditScore.getMintPriceWithProtocolFee(
        ethers.constants.AddressZero
      );
      const projectFeeWalletBalanceBefore =
        await ethers.provider.getBalance(projectFeeReceiver);

      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,uint256,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          identityId1,
          authority.address,
          signatureDate,
          signatureToIdentity,
          { value: price }
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );

      const projectFeeWalletBalanceAfter =
        await ethers.provider.getBalance(projectFeeReceiver);

      // we check that the project fee wallet received the ETH
      expect(
        projectFeeWalletBalanceAfter.sub(projectFeeWalletBalanceBefore)
      ).to.be.equal(price);
    });

    it("should mint from final user identity paying with stable coin", async () => {
      const { price } = await soulboundCreditScore.getMintPriceWithProtocolFee(
        env.USDC_TOKEN
      );

      // set allowance for soul store
      const usdc: IERC20 = IERC20__factory.connect(env.USDC_TOKEN, owner);
      await usdc.connect(address1).approve(soulboundCreditScore.address, price);

      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,uint256,address,uint256,bytes)"](
          env.USDC_TOKEN,
          identityId1,
          authority.address,
          signatureDate,
          signatureToIdentity
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![1].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );
    });

    it("should mint from final user identity paying with MASA coin", async () => {
      const { price } = await soulboundCreditScore.getMintPriceWithProtocolFee(
        env.MASA_TOKEN
      );

      // set allowance for soul store
      const usdc: IERC20 = IERC20__factory.connect(env.MASA_TOKEN, owner);
      await usdc.connect(address1).approve(soulboundCreditScore.address, price);

      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,uint256,address,uint256,bytes)"](
          env.MASA_TOKEN,
          identityId1,
          authority.address,
          signatureDate,
          signatureToIdentity
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![2].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );
    });

    it("should fail to get minting info for invalid payment method", async () => {
      await expect(
        soulboundCreditScore.getMintPriceWithProtocolFee(owner.address)
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
            signatureToIdentity
          )
      ).to.be.rejectedWith("InvalidPaymentMethod");
    });
  });

  describe("mint paying a minting fee and protocol fee", () => {
    beforeEach(async () => {
      await soulboundCreditScore.connect(owner).setMintPrice(10_000_000); // 10 USD
    });

    it("should mint from final user address paying with ETH (with protocol fee percent)", async () => {
      await soulboundCreditScore
        .connect(owner)
        .setProtocolFeeReceiver(protocolWallet.address);
      await soulboundCreditScore.connect(owner).setProtocolFeePercent(10); // 10%

      const projectFeeReceiver =
        await soulboundCreditScore.projectFeeReceiver();
      const protocolFeeReceiver =
        await soulboundCreditScore.protocolFeeReceiver();
      const { price, protocolFee } =
        await soulboundCreditScore.getMintPriceWithProtocolFee(
          ethers.constants.AddressZero
        );
      const projectFeeWalletBalanceBefore =
        await ethers.provider.getBalance(projectFeeReceiver);
      const protocolWalletBalanceBefore =
        await ethers.provider.getBalance(protocolFeeReceiver);

      await expect(
        soulboundCreditScore
          .connect(address1)
          ["mint(address,address,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            address1.address,
            authority.address,
            signatureDate,
            signatureToAddress,
            { value: price }
          )
      ).to.be.revertedWith("InsufficientEthAmount");

      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress,
          { value: price.add(protocolFee) }
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );

      const projectFeeWalletBalanceAfter =
        await ethers.provider.getBalance(projectFeeReceiver);
      const protocolWalletBalanceAfter =
        await ethers.provider.getBalance(protocolFeeReceiver);

      // we check that the project fee wallet received the ETH
      expect(
        projectFeeWalletBalanceAfter.sub(projectFeeWalletBalanceBefore)
      ).to.be.equal(price);
      expect(
        protocolWalletBalanceAfter.sub(protocolWalletBalanceBefore)
      ).to.be.equal(protocolFee);
    });

    it("should mint from final user address paying with ETH (with protocol fee percent substracted)", async () => {
      await soulboundCreditScore
        .connect(owner)
        .setProtocolFeeReceiver(protocolWallet.address);
      await soulboundCreditScore.connect(owner).setProtocolFeePercentSub(10); // 10%

      const projectFeeReceiver =
        await soulboundCreditScore.projectFeeReceiver();
      const protocolFeeReceiver =
        await soulboundCreditScore.protocolFeeReceiver();
      const { price } = await soulboundCreditScore.getMintPriceWithProtocolFee(
        ethers.constants.AddressZero
      );
      const protocolFeeSub = price.mul(10).div(100);

      const projectFeeWalletBalanceBefore =
        await ethers.provider.getBalance(projectFeeReceiver);
      const protocolWalletBalanceBefore =
        await ethers.provider.getBalance(protocolFeeReceiver);

      await expect(
        soulboundCreditScore
          .connect(address1)
          ["mint(address,address,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            address1.address,
            authority.address,
            signatureDate,
            signatureToAddress,
            { value: price.sub(1) }
          )
      ).to.be.revertedWith("InsufficientEthAmount");

      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress,
          { value: price }
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );

      const projectFeeWalletBalanceAfter =
        await ethers.provider.getBalance(projectFeeReceiver);
      const protocolWalletBalanceAfter =
        await ethers.provider.getBalance(protocolFeeReceiver);

      // we check that the project fee wallet received the ETH

      expect(
        projectFeeWalletBalanceAfter.sub(projectFeeWalletBalanceBefore)
      ).to.be.equal(price.sub(protocolFeeSub));
      expect(
        protocolWalletBalanceAfter.sub(protocolWalletBalanceBefore)
      ).to.be.equal(protocolFeeSub);
    });

    it("should mint from final user address paying with ETH (with protocol fee amount)", async () => {
      await soulboundCreditScore
        .connect(owner)
        .setProtocolFeeReceiver(protocolWallet.address);
      await soulboundCreditScore.connect(owner).setProtocolFeeAmount(1_000_000); // 1 USD

      const projectFeeReceiver =
        await soulboundCreditScore.projectFeeReceiver();
      const protocolFeeReceiver =
        await soulboundCreditScore.protocolFeeReceiver();
      const { price, protocolFee } =
        await soulboundCreditScore.getMintPriceWithProtocolFee(
          ethers.constants.AddressZero
        );
      const projectFeeWalletBalanceBefore =
        await ethers.provider.getBalance(projectFeeReceiver);
      const protocolWalletBalanceBefore =
        await ethers.provider.getBalance(protocolFeeReceiver);

      await expect(
        soulboundCreditScore
          .connect(address1)
          ["mint(address,address,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            address1.address,
            authority.address,
            signatureDate,
            signatureToAddress,
            { value: price }
          )
      ).to.be.revertedWith("InsufficientEthAmount");

      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress,
          { value: price.add(protocolFee) }
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );

      const projectFeeWalletBalanceAfter =
        await ethers.provider.getBalance(projectFeeReceiver);
      const protocolWalletBalanceAfter =
        await ethers.provider.getBalance(protocolFeeReceiver);

      // we check that the project fee wallet received the ETH
      expect(
        projectFeeWalletBalanceAfter.sub(projectFeeWalletBalanceBefore)
      ).to.be.equal(price);
      expect(
        protocolWalletBalanceAfter.sub(protocolWalletBalanceBefore)
      ).to.be.equal(protocolFee);
    });

    it("should mint from final user address paying with stable coin (with protocol fee percent)", async () => {
      await soulboundCreditScore
        .connect(owner)
        .setProtocolFeeReceiver(protocolWallet.address);
      await soulboundCreditScore.connect(owner).setProtocolFeePercent(10); // 10%

      const projectFeeReceiver =
        await soulboundCreditScore.projectFeeReceiver();
      const protocolFeeReceiver =
        await soulboundCreditScore.protocolFeeReceiver();
      const { price, protocolFee } =
        await soulboundCreditScore.getMintPriceWithProtocolFee(env.USDC_TOKEN);

      const usdc: IERC20 = IERC20__factory.connect(env.USDC_TOKEN, owner);
      const projectFeeWalletBalanceBefore =
        await usdc.balanceOf(projectFeeReceiver);
      const protocolWalletBalanceBefore =
        await usdc.balanceOf(protocolFeeReceiver);

      // set allowance for soul store
      await usdc
        .connect(address1)
        .approve(soulboundCreditScore.address, price.add(protocolFee));

      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          env.USDC_TOKEN,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![2].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );

      const projectFeeWalletBalanceAfter =
        await usdc.balanceOf(projectFeeReceiver);
      const protocolWalletBalanceAfter =
        await usdc.balanceOf(protocolFeeReceiver);

      // we check that the project fee wallet received the ETH
      expect(
        projectFeeWalletBalanceAfter.sub(projectFeeWalletBalanceBefore)
      ).to.be.equal(price);
      expect(
        protocolWalletBalanceAfter.sub(protocolWalletBalanceBefore)
      ).to.be.equal(protocolFee);
    });

    it("should mint from final user address paying with stable coin (with protocol fee percent substracted)", async () => {
      await soulboundCreditScore
        .connect(owner)
        .setProtocolFeeReceiver(protocolWallet.address);
      await soulboundCreditScore.connect(owner).setProtocolFeePercentSub(10); // 10%

      const projectFeeReceiver =
        await soulboundCreditScore.projectFeeReceiver();
      const protocolFeeReceiver =
        await soulboundCreditScore.protocolFeeReceiver();
      const { price } = await soulboundCreditScore.getMintPriceWithProtocolFee(
        env.USDC_TOKEN
      );
      const protocolFeeSub = price.mul(10).div(100);

      const usdc: IERC20 = IERC20__factory.connect(env.USDC_TOKEN, owner);
      const projectFeeWalletBalanceBefore =
        await usdc.balanceOf(projectFeeReceiver);
      const protocolWalletBalanceBefore =
        await usdc.balanceOf(protocolFeeReceiver);

      // set allowance for soul store
      await usdc.connect(address1).approve(soulboundCreditScore.address, price);

      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          env.USDC_TOKEN,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![2].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );

      const projectFeeWalletBalanceAfter =
        await usdc.balanceOf(projectFeeReceiver);
      const protocolWalletBalanceAfter =
        await usdc.balanceOf(protocolFeeReceiver);

      // we check that the project fee wallet received the ETH
      expect(
        projectFeeWalletBalanceAfter.sub(projectFeeWalletBalanceBefore)
      ).to.be.equal(price.sub(protocolFeeSub));
      expect(
        protocolWalletBalanceAfter.sub(protocolWalletBalanceBefore)
      ).to.be.equal(protocolFeeSub);
    });

    it("should mint from final user address paying with stable coin (with protocol fee amount)", async () => {
      await soulboundCreditScore
        .connect(owner)
        .setProtocolFeeReceiver(protocolWallet.address);
      await soulboundCreditScore.connect(owner).setProtocolFeeAmount(1_000_000); // 1 USD

      const projectFeeReceiver =
        await soulboundCreditScore.projectFeeReceiver();
      const protocolFeeReceiver =
        await soulboundCreditScore.protocolFeeReceiver();
      const { price, protocolFee } =
        await soulboundCreditScore.getMintPriceWithProtocolFee(env.USDC_TOKEN);

      const usdc: IERC20 = IERC20__factory.connect(env.USDC_TOKEN, owner);
      const projectFeeWalletBalanceBefore =
        await usdc.balanceOf(projectFeeReceiver);
      const protocolWalletBalanceBefore =
        await usdc.balanceOf(protocolFeeReceiver);

      // set allowance for soul store
      await usdc
        .connect(address1)
        .approve(soulboundCreditScore.address, price.add(protocolFee));

      const mintTx = await soulboundCreditScore
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          env.USDC_TOKEN,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );
      const mintReceipt = await mintTx.wait();

      const tokenId = mintReceipt.events![2].args![1].toNumber();

      expect(await soulboundCreditScore.getIdentityId(tokenId)).to.equal(
        identityId1
      );

      const projectFeeWalletBalanceAfter =
        await usdc.balanceOf(projectFeeReceiver);
      const protocolWalletBalanceAfter =
        await usdc.balanceOf(protocolFeeReceiver);

      // we check that the project fee wallet received the ETH
      expect(
        projectFeeWalletBalanceAfter.sub(projectFeeWalletBalanceBefore)
      ).to.be.equal(price);
      expect(
        protocolWalletBalanceAfter.sub(protocolWalletBalanceBefore)
      ).to.be.equal(protocolFee);
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
          signatureToAddress
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
          signatureToAddress
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
