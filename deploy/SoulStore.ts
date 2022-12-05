import hre from "hardhat";
import { getEnvParams, getPrivateKey } from "../src/utils/EnvParams";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import {
  MASA_GOERLI,
  SWAPROUTER_GOERLI,
  USDC_GOERLI,
  WETH_GOERLI
} from "../src/constants";

let admin: SignerWithAddress;

const func: DeployFunction = async ({
  // @ts-ignore
  getNamedAccounts,
  // @ts-ignore
  deployments,
  // @ts-ignore
  ethers,
  network
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  [, admin] = await ethers.getSigners();
  const env = getEnvParams(network.name);

  const masa = await deployments.get("MASA");
  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");
  const soulNameDeployed = await deployments.get("SoulName");

  let swapRouter: string;
  let wrappedNativeToken: string; // weth
  let stableCoin: string; // usdc

  if (network.name == "mainnet") {
    // mainnet
    swapRouter = SWAPROUTER_GOERLI;
    wrappedNativeToken = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    stableCoin = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  } else if (network.name == "goerli") {
    // goerli
    swapRouter = SWAPROUTER_GOERLI;
    wrappedNativeToken = WETH_GOERLI;
    stableCoin = USDC_GOERLI;
  } else if (network.name == "hardhat") {
    // hardhat
    swapRouter = SWAPROUTER_GOERLI;
    wrappedNativeToken = WETH_GOERLI;
    stableCoin = USDC_GOERLI;
  } else if (network.name == "alfajores") {
    // alfajores
    swapRouter = "0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121"; // Ubeswap
    wrappedNativeToken = "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9";
    stableCoin = "0x37f39aD164cBBf0Cc03Dd638472F3FbeC7aE426C";
  } else {
    throw new Error("Network not supported");
  }

  const constructorArguments = [
    env.ADMIN || admin.address,
    soulboundIdentityDeployed.address,
    "10000000", // 10 USDC, with 6 decimals
    [
      swapRouter,
      wrappedNativeToken,
      stableCoin,
      network.name == "hardhat" || network.name == "goerli"
        ? MASA_GOERLI // MASA
        : masa.address,
      env.RESERVE_WALLET || admin.address
    ]
  ];

  const soulStoreDeploymentResult = await deploy("SoulStore", {
    from: deployer,
    args: constructorArguments,
    log: true
  });

  // verify contract with etherscan, if its not a local network
  if (network.name == "mainnet" || network.name == "goerli") {
    try {
      await hre.run("verify:verify", {
        address: soulStoreDeploymentResult.address,
        constructorArguments
      });
    } catch (error) {
      if (
        !error.message.includes("Contract source code already verified") &&
        !error.message.includes("Reason: Already Verified")
      ) {
        throw error;
      }
    }
  }

  const soulboundIdentity = await ethers.getContractAt(
    "SoulboundIdentity",
    soulboundIdentityDeployed.address
  );
  const soulName = await ethers.getContractAt(
    "SoulName",
    soulNameDeployed.address
  );

  const signer = env.ADMIN
    ? new ethers.Wallet(
        getPrivateKey(network.name),
        ethers.getDefaultProvider(network.name)
      )
    : admin;

  // we set the registration prices per year and length of name
  const soulStore = await ethers.getContractAt(
    "SoulStore",
    soulStoreDeploymentResult.address
  );
  await soulStore
    .connect(signer)
    .setNameRegistrationPricePerYear(1, 50000000000); // 1 length, 50,000 USDC
  await soulStore
    .connect(signer)
    .setNameRegistrationPricePerYear(2, 5000000000); // 2 length, 5,000 USDC
  await soulStore
    .connect(signer)
    .setNameRegistrationPricePerYear(3, 1500000000); // 3 length, 1,500 USDC
  await soulStore.connect(signer).setNameRegistrationPricePerYear(4, 500000000); // 4 length, 500 USDC

  // we add soulStore as soulboundIdentity and soulName minter

  const IDENTITY_MINTER_ROLE = await soulboundIdentity.MINTER_ROLE();
  await soulboundIdentity
    .connect(signer)
    .grantRole(IDENTITY_MINTER_ROLE, soulStoreDeploymentResult.address);

  const NAME_MINTER_ROLE = await soulName.MINTER_ROLE();
  await soulName
    .connect(signer)
    .grantRole(NAME_MINTER_ROLE, soulStoreDeploymentResult.address);
};

func.tags = ["SoulStore"];
func.dependencies = ["MASA", "SoulboundIdentity", "SoulName"];
export default func;
