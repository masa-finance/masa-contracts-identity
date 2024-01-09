import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments, getChainId, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  IERC20,
  IERC20__factory,
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

const DAI_GOERLI = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60";

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
        "Masa Soul Name",
        "MSN",
        soulboundIdentityAddress,
        ".soul",
        "ar://bfG2m3VJU19fj6uGgyaxNY0QhK0G7RINYtw-GRVVqTM"
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
    await soulName["mint(address,string,uint256,string)"](
      address1.address,
      SOUL_NAME,
      YEAR,
      ARWEAVE_LINK
    );

    // we add authority account
    await soulStore.addAuthority(authority.address);
  });

  describe("check", () => {
    it("should check soulNameV1 address", async () => {
      console.log("soulNameV1", soulNameV1.address);
    });
  });
});
