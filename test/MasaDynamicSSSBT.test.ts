import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { deployments, ethers, getChainId } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  MasaDynamicSSSBT,
  MasaDynamicSSSBT__factory,
  SoulboundIdentity,
  SoulboundIdentity__factory
} from "../typechain";
import { getEnvParams } from "../src/EnvParams";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulboundIdentity: SoulboundIdentity;
let sbtDynamic: MasaDynamicSSSBT;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let authority: SignerWithAddress;

const signatureDate = Math.floor(Date.now() / 1000);
const discordState = "discord";
const twitterState = "twitter";

const signSetStateToAccount = async (
  account: string,
  state: string,
  value: boolean,
  authoritySigner: SignerWithAddress
) => {
  const chainId = await getChainId();

  const signature = await authoritySigner._signTypedData(
    // Domain
    {
      name: "MasaDynamicSSSBT",
      version: "1.0.0",
      chainId: chainId,
      verifyingContract: sbtDynamic.address
    },
    // Types
    {
      SetState: [
        { name: "account", type: "address" },
        { name: "state", type: "string" },
        { name: "value", type: "bool" },
        { name: "authorityAddress", type: "address" },
        { name: "signatureDate", type: "uint256" }
      ]
    },
    // Value
    {
      account: account,
      state: state,
      value: value,
      authorityAddress: authoritySigner.address,
      signatureDate: signatureDate
    }
  );

  return signature;
};

const signSetStateToTokenId = async (
  tokenId: number,
  state: string,
  value: boolean,
  authoritySigner: SignerWithAddress
) => {
  const chainId = await getChainId();

  const signature = await authoritySigner._signTypedData(
    // Domain
    {
      name: "MasaDynamicSSSBT",
      version: "1.0.0",
      chainId: chainId,
      verifyingContract: sbtDynamic.address
    },
    // Types
    {
      SetState: [
        { name: "tokenId", type: "uint256" },
        { name: "state", type: "string" },
        { name: "value", type: "bool" },
        { name: "authorityAddress", type: "address" },
        { name: "signatureDate", type: "uint256" }
      ]
    },
    // Value
    {
      tokenId: tokenId,
      state: state,
      value: value,
      authorityAddress: authoritySigner.address,
      signatureDate: signatureDate
    }
  );

  return signature;
};

const signSetStatesAndMint = async (
  account: string,
  states: string[],
  authoritySigner: SignerWithAddress
) => {
  const chainId = await getChainId();

  const signature = await authoritySigner._signTypedData(
    // Domain
    {
      name: "MasaDynamicSSSBT",
      version: "1.0.0",
      chainId: chainId,
      verifyingContract: sbtDynamic.address
    },
    // Types
    {
      setStatesAndMint: [
        { name: "account", type: "address" },
        { name: "states", type: "string[]" },
        { name: "authorityAddress", type: "address" },
        { name: "signatureDate", type: "uint256" }
      ]
    },
    // Value
    {
      account: account,
      states: states,
      authorityAddress: authoritySigner.address,
      signatureDate: signatureDate
    }
  );

  return signature;
};

describe("MasaDynamicSSSBT", () => {
  before(async () => {
    [, owner, address1, authority] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: true });

    const { address: soulboundIdentityAddress } =
      await deployments.get("SoulboundIdentity");

    const env = getEnvParams("hardhat");
    const baseUri = `${env.BASE_URI}/green/hardhat/`;

    const SBTDynamic = await ethers.getContractFactory("MasaDynamicSSSBT");
    const sbtDynamicDeploy = await SBTDynamic.deploy(
      env.ADMIN || owner.address,
      env.SOULBOUNDGREEN_NAME,
      env.SOULBOUNDGREEN_SYMBOL,
      baseUri,
      soulboundIdentityAddress,
      {
        swapRouter: env.SWAP_ROUTER,
        wrappedNativeToken: env.WETH_TOKEN,
        stableCoin: env.USDC_TOKEN,
        masaToken: env.MASA_TOKEN,
        projectFeeReceiver: env.PROJECTFEE_RECEIVER || owner.address,
        protocolFeeReceiver:
          env.PROTOCOLFEE_RECEIVER || ethers.constants.AddressZero,
        protocolFeeAmount: env.PROTOCOLFEE_AMOUNT || 0,
        protocolFeePercent: env.PROTOCOLFEE_PERCENT || 0,
        protocolFeePercentSub: env.PROTOCOLFEE_PERCENT_SUB || 0
      },
      1
    );
    await sbtDynamicDeploy.deployed();

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );

    sbtDynamic = MasaDynamicSSSBT__factory.connect(
      sbtDynamicDeploy.address,
      owner
    );

    // we mint identity SBT
    const mintTx = await soulboundIdentity
      .connect(owner)
      ["mint(address)"](address1.address);

    // we add authority account
    await sbtDynamic.addAuthority(authority.address);
  });

  describe("owner functions", () => {
    it("should set SoulboundIdentity from owner", async () => {
      await sbtDynamic.connect(owner).setSoulboundIdentity(address1.address);

      expect(await sbtDynamic.soulboundIdentity()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set SoulboundIdentity from non owner", async () => {
      await expect(
        sbtDynamic.connect(address1).setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });

    it("should add state from owner", async () => {
      await sbtDynamic.connect(owner).addBeforeMintState(discordState);
      await sbtDynamic.connect(owner).addBeforeMintState(twitterState);

      expect(await sbtDynamic.getBeforeMintStates()).to.deep.equal([
        discordState,
        twitterState
      ]);

      await sbtDynamic.connect(owner).addAfterMintState(discordState);

      expect(await sbtDynamic.getAfterMintStates()).to.deep.equal([
        discordState
      ]);
    });

    it("should fail to add state from non owner", async () => {
      await expect(
        sbtDynamic.connect(address1).addBeforeMintState(discordState)
      ).to.be.rejected;
      await expect(sbtDynamic.connect(address1).addAfterMintState(discordState))
        .to.be.rejected;
    });

    it("should remove beforeMintState from owner", async () => {
      await sbtDynamic.connect(owner).addBeforeMintState(discordState);

      await sbtDynamic.connect(owner).removeBeforeMintState(discordState);

      expect(await sbtDynamic.getBeforeMintStates()).to.deep.equal([]);
    });

    it("should fail to remove beforeMintState from non owner", async () => {
      await sbtDynamic.connect(owner).addBeforeMintState(discordState);

      await expect(
        sbtDynamic.connect(address1).removeBeforeMintState(discordState)
      ).to.be.rejected;
    });

    it("should remove afterMintState from owner", async () => {
      await sbtDynamic.connect(owner).addAfterMintState(discordState);

      await sbtDynamic.connect(owner).removeAfterMintState(discordState);

      expect(await sbtDynamic.getAfterMintStates()).to.deep.equal([]);
    });

    it("should fail to remove afterMintState from non owner", async () => {
      await sbtDynamic.connect(owner).addAfterMintState(discordState);

      await expect(
        sbtDynamic.connect(address1).removeAfterMintState(discordState)
      ).to.be.rejected;
    });
  });

  describe("sbt information", () => {
    it("should be able to get sbt information", async () => {
      expect(await sbtDynamic.name()).to.equal("Masa Green");

      expect(await sbtDynamic.symbol()).to.equal("MG-2FA");
    });
  });

  describe("mint", () => {
    it("can't mint if no beforeMintStates are added", async () => {
      await expect(
        sbtDynamic
          .connect(address1)
          [
            "mint(address,address)"
          ](ethers.constants.AddressZero, address1.address)
      ).to.be.rejectedWith("WithoutBeforeMintStates");

      expect(await sbtDynamic.balanceOf(address1.address)).to.equal(0);
      expect(await sbtDynamic.totalSupply()).to.equal(0);
    });
  });

  describe("beforeMintStates", () => {
    let signatureSetDiscordStateToAccount;
    let signatureSetTwitterStateToAccount;

    beforeEach(async () => {
      await sbtDynamic.connect(owner).addBeforeMintState(discordState);
      await sbtDynamic.connect(owner).addBeforeMintState(twitterState);

      expect(await sbtDynamic.getBeforeMintStates()).to.deep.equal([
        discordState,
        twitterState
      ]);

      signatureSetDiscordStateToAccount = await signSetStateToAccount(
        address1.address,
        discordState,
        true,
        authority
      );
      signatureSetTwitterStateToAccount = await signSetStateToAccount(
        address1.address,
        twitterState,
        true,
        authority
      );
    });

    it("should not mint if not all before mint states are set", async () => {
      await expect(
        sbtDynamic
          .connect(address1)
          [
            "mint(address,address)"
          ](ethers.constants.AddressZero, address1.address)
      ).to.be.rejected;

      await sbtDynamic
        .connect(address1)
        [
          "setState(address,string,bool,address,uint256,bytes)"
        ](address1.address, discordState, true, authority.address, signatureDate, signatureSetDiscordStateToAccount);

      await expect(
        sbtDynamic
          .connect(address1)
          [
            "mint(address,address)"
          ](ethers.constants.AddressZero, address1.address)
      ).to.be.rejected;
    });

    it("should mint if all before mint states are set", async () => {
      await sbtDynamic
        .connect(address1)
        [
          "setState(address,string,bool,address,uint256,bytes)"
        ](address1.address, discordState, true, authority.address, signatureDate, signatureSetDiscordStateToAccount);

      await sbtDynamic
        .connect(address1)
        [
          "setState(address,string,bool,address,uint256,bytes)"
        ](address1.address, twitterState, true, authority.address, signatureDate, signatureSetTwitterStateToAccount);

      await sbtDynamic
        .connect(address1)
        [
          "mint(address,address)"
        ](ethers.constants.AddressZero, address1.address);

      expect(await sbtDynamic.beforeMintState(address1.address, discordState))
        .to.be.true;
      expect(await sbtDynamic.beforeMintState(address1.address, twitterState))
        .to.be.true;
      expect(await sbtDynamic.allBeforeMintStatesSet(address1.address)).to.be
        .true;
      expect(await sbtDynamic.balanceOf(address1.address)).to.equal(1);
      expect(await sbtDynamic.totalSupply()).to.equal(1);
    });

    it("test setStatesAndMint funtion", async () => {
      const signatureSetStatesAndMint = await signSetStatesAndMint(
        address1.address,
        [discordState, twitterState],
        authority
      );

      await sbtDynamic
        .connect(address1)
        .setStatesAndMint(
          ethers.constants.AddressZero,
          address1.address,
          [discordState, twitterState],
          authority.address,
          signatureDate,
          signatureSetStatesAndMint
        );

      expect(await sbtDynamic.beforeMintState(address1.address, discordState))
        .to.be.true;
      expect(await sbtDynamic.beforeMintState(address1.address, twitterState))
        .to.be.true;
      expect(await sbtDynamic.allBeforeMintStatesSet(address1.address)).to.be
        .true;
      expect(await sbtDynamic.balanceOf(address1.address)).to.equal(1);
      expect(await sbtDynamic.totalSupply()).to.equal(1);
    });
  });

  describe("afterMintStates", () => {
    let signatureSetDiscordStateToAccount;
    let signatureSetTwitterStateToAccount;
    let tokenId;

    beforeEach(async () => {
      await sbtDynamic.connect(owner).addBeforeMintState(discordState);
      await sbtDynamic.connect(owner).addAfterMintState(discordState);
      await sbtDynamic.connect(owner).addAfterMintState(twitterState);

      expect(await sbtDynamic.getAfterMintStates()).to.deep.equal([
        discordState,
        twitterState
      ]);

      const signatureSetDiscordBeforeStateToAccount =
        await signSetStateToAccount(
          address1.address,
          discordState,
          true,
          authority
        );
      await sbtDynamic
        .connect(address1)
        [
          "setState(address,string,bool,address,uint256,bytes)"
        ](address1.address, discordState, true, authority.address, signatureDate, signatureSetDiscordBeforeStateToAccount);

      const mintTx = await sbtDynamic
        .connect(address1)
        [
          "mint(address,address)"
        ](ethers.constants.AddressZero, address1.address);
      const mintReceipt = await mintTx.wait();

      tokenId = mintReceipt.events![0].args![1].toNumber();

      signatureSetDiscordStateToAccount = await signSetStateToTokenId(
        tokenId,
        discordState,
        true,
        authority
      );
      signatureSetTwitterStateToAccount = await signSetStateToTokenId(
        tokenId,
        twitterState,
        true,
        authority
      );
    });

    it("should set all after mint states", async () => {
      await sbtDynamic
        .connect(address1)
        [
          "setState(uint256,string,bool,address,uint256,bytes)"
        ](tokenId, discordState, true, authority.address, signatureDate, signatureSetDiscordStateToAccount);

      await sbtDynamic
        .connect(address1)
        [
          "setState(uint256,string,bool,address,uint256,bytes)"
        ](tokenId, twitterState, true, authority.address, signatureDate, signatureSetTwitterStateToAccount);

      expect(await sbtDynamic.afterMintState(tokenId, discordState)).to.be.true;
      expect(await sbtDynamic.afterMintState(tokenId, twitterState)).to.be.true;
      expect(await sbtDynamic.allAfterMintStatesSet(tokenId)).to.be.true;
    });
  });
});
