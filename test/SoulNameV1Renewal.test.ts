import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments, getChainId, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  SoulName,
  SoulName__factory,
  SoulStore,
  SoulStore__factory,
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
let soulStore: SoulStore;
let soulName: SoulName;
let soulNameV1: SoulName;

let owner: SignerWithAddress;
let protocolWallet: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;
let authority: SignerWithAddress;

const SOUL_NAME = "soulNameTest";
const YEAR = 1; // 1 year
const YEAR_PERIOD = 31536000; // 60 seconds * 60 minutes * 24 hours * 365 days
const ARWEAVE_LINK = "ar://jK9sR4OrYvODj7PD3czIAyNJalub0-vdV_JAg1NqQ-o";
const ARWEAVE_LINK2 = "ar://2Ohog_ya_61nTJlKox43L4ZQzZ9DGRao8NU6WZRxs8";

const signMintSoulName = async (
  to: string,
  name: string,
  nameLength: number,
  yearsPeriod: number,
  tokenURI: string,
  authoritySigner: SignerWithAddress
) => {
  const chainId = await getChainId();

  const signature = await authoritySigner._signTypedData(
    // Domain
    {
      name: "SoulStore",
      version: "2.0.0",
      chainId: chainId,
      verifyingContract: soulStore.address
    },
    // Types
    {
      MintSoulName: [
        { name: "to", type: "address" },
        { name: "name", type: "string" },
        { name: "nameLength", type: "uint256" },
        { name: "yearsPeriod", type: "uint256" },
        { name: "tokenURI", type: "string" }
      ]
    },
    // Value
    {
      to: to,
      name: name,
      nameLength: nameLength,
      yearsPeriod: yearsPeriod,
      tokenURI: tokenURI
    }
  );

  return signature;
};

const signRenewSoulName = async (
  to: string,
  name: string,
  nameLength: number,
  yearsPeriod: number,
  authoritySigner: SignerWithAddress
) => {
  const chainId = await getChainId();

  const signature = await authoritySigner._signTypedData(
    // Domain
    {
      name: "SoulStore",
      version: "2.0.0",
      chainId: chainId,
      verifyingContract: soulStore.address
    },
    // Types
    {
      RenewSoulName: [
        { name: "to", type: "address" },
        { name: "name", type: "string" },
        { name: "nameLength", type: "uint256" },
        { name: "yearsPeriod", type: "uint256" }
      ]
    },
    // Value
    {
      to: to,
      name: name,
      nameLength: nameLength,
      yearsPeriod: yearsPeriod
    }
  );

  return signature;
};

describe("Soul Name V1 Renewal", () => {
  before(async () => {
    [, owner, protocolWallet, address1, , address2, authority] =
      await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulName", { fallbackToGlobal: false });
    await deployments.fixture("SoulStore", { fallbackToGlobal: false });

    const { address: soulboundIdentityAddress } =
      await deployments.get("SoulboundIdentity");
    const { address: soulStoreAddress } = await deployments.get("SoulStore");
    const { address: soulNameAddress } = await deployments.get("SoulName");

    const soulNameV1DeploymentResult = await deployments.deploy("SoulName", {
      from: owner.address,
      args: [
        owner.address,
        env.SOULNAME_NAME + " v1",
        env.SOULNAME_SYMBOL,
        soulboundIdentityAddress,
        env.SOULNAME_EXTENSION || ".soul",
        env.SOUL_NAME_CONTRACT_URI
      ],
      log: true
    });

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      owner
    );
    soulStore = SoulStore__factory.connect(soulStoreAddress, owner);
    soulName = SoulName__factory.connect(soulNameAddress, owner);
    soulNameV1 = SoulName__factory.connect(
      soulNameV1DeploymentResult.address,
      owner
    );

    await soulboundIdentity["mint(address)"](address1.address);
    await soulboundIdentity["mint(address)"](address2.address);
    await soulNameV1["mint(address,string,uint256,string)"](
      address1.address,
      SOUL_NAME,
      YEAR,
      ARWEAVE_LINK
    );

    // we set the soul name v1 contract in the soul store
    await soulStore.setSoulNameV1(soulNameV1.address);

    // we add authority account
    await soulStore.addAuthority(authority.address);
  });

  describe("purchase name renewal", async () => {
    it("should renew period when period hasn't expired", async () => {
      // increase time to half the registration period
      await network.provider.send("evm_increaseTime", [YEAR_PERIOD / 2]);
      await network.provider.send("evm_mine");

      const { expirationDate: expirationDateStart } =
        await soulNameV1.getTokenData(SOUL_NAME);

      const { price } = await soulStore.getPriceForMintingNameWithProtocolFee(
        ethers.constants.AddressZero,
        SOUL_NAME.length,
        YEAR
      );

      const signature = await signRenewSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        authority
      );

      await soulStore.connect(address1).purchaseNameRenewal(
        ethers.constants.AddressZero, // ETH
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        authority.address,
        signature,
        { value: price }
      );

      const { expirationDate: expirationDateFinish, active } =
        await soulName.getTokenData(SOUL_NAME);

      expect(
        expirationDateFinish.toNumber() - expirationDateStart.toNumber()
      ).to.be.equal(YEAR_PERIOD);
      expect(active).to.be.true;
    });

    it("should renew period when period has expired", async () => {
      // increase time to expire the registration period
      await network.provider.send("evm_increaseTime", [YEAR_PERIOD * 2]);
      await network.provider.send("evm_mine");

      const { expirationDate: expirationDateStart } =
        await soulNameV1.getTokenData(SOUL_NAME);

      const { price } = await soulStore.getPriceForMintingNameWithProtocolFee(
        ethers.constants.AddressZero,
        SOUL_NAME.length,
        YEAR
      );

      const signature = await signRenewSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        authority
      );

      await soulStore.connect(address1).purchaseNameRenewal(
        ethers.constants.AddressZero, // ETH
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        authority.address,
        signature,
        { value: price }
      );

      const { expirationDate: expirationDateFinish, active } =
        await soulName.getTokenData(SOUL_NAME);

      expect(
        expirationDateFinish.toNumber() - expirationDateStart.toNumber()
      ).to.be.above(YEAR_PERIOD);
      expect(active).to.be.true;
    });

    it("should allow mint same name if previous has expired", async () => {
      // increase time to expire the registration period
      await network.provider.send("evm_increaseTime", [YEAR_PERIOD * 2]);
      await network.provider.send("evm_mine");

      // once expired, another user mints the same soul name
      await soulName
        .connect(owner)
        [
          "mint(address,string,uint256,string)"
        ](address2.address, SOUL_NAME, YEAR, ARWEAVE_LINK2);
    });

    it("shouldn't renew period when period has expired and somebody has minted same name with SoulName V2", async () => {
      // increase time to expire the registration period
      await network.provider.send("evm_increaseTime", [YEAR_PERIOD * 2]);
      await network.provider.send("evm_mine");

      // once expired, another user mints the same soul name
      await soulName
        .connect(owner)
        [
          "mint(address,string,uint256,string)"
        ](address2.address, SOUL_NAME, YEAR, ARWEAVE_LINK2);

      // the first owner of the soul name tries to renew the period and fails
      const { price } = await soulStore.getPriceForMintingNameWithProtocolFee(
        ethers.constants.AddressZero,
        SOUL_NAME.length,
        YEAR
      );

      const signature = await signRenewSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        authority
      );

      await expect(
        soulStore.connect(address1).purchaseNameRenewal(
          ethers.constants.AddressZero, // ETH
          address1.address,
          SOUL_NAME,
          SOUL_NAME.length,
          YEAR,
          authority.address,
          signature,
          { value: price }
        )
      ).to.be.rejectedWith("InvalidToAddress");
    });

    it("shouldn't renew period when period has expired and somebody has minted same name with SoulName V1", async () => {
      // increase time to expire the registration period
      await network.provider.send("evm_increaseTime", [YEAR_PERIOD * 2]);
      await network.provider.send("evm_mine");

      // once expired, another user mints the same soul name v1
      await soulNameV1
        .connect(owner)
        [
          "mint(address,string,uint256,string)"
        ](address2.address, SOUL_NAME, YEAR, ARWEAVE_LINK2);

      // the first owner of the soul name tries to renew the period and fails
      const { price } = await soulStore.getPriceForMintingNameWithProtocolFee(
        ethers.constants.AddressZero,
        SOUL_NAME.length,
        YEAR
      );

      const signature = await signRenewSoulName(
        address1.address,
        SOUL_NAME,
        SOUL_NAME.length,
        YEAR,
        authority
      );

      await expect(
        soulStore.connect(address1).purchaseNameRenewal(
          ethers.constants.AddressZero, // ETH
          address1.address,
          SOUL_NAME,
          SOUL_NAME.length,
          YEAR,
          authority.address,
          signature,
          { value: price }
        )
      ).to.be.rejectedWith("InvalidToAddress");
    });
  });
});
