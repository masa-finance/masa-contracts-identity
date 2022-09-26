import hre from "hardhat";
import { getEnvParams, getPrivateKey } from "../src/utils/EnvParams";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import {
  CORN_GOERLI,
  SWAPROUTER_GOERLI,
  USDC_GOERLI,
  WETH_GOERLI
} from "../src/constants";

let owner: SignerWithAddress;

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

  [, owner] = await ethers.getSigners();
  const env = getEnvParams(network.name);

  const corn = await deployments.get("CORN");
  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");
  const soulNameDeployed = await deployments.get("SoulName");

  let stableCoin: string; // usdc
  let wrappedNativeToken: string; // weth
  let swapRouter: string;

  if (network.name == "mainnet") {
    // mainnet
    stableCoin = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    wrappedNativeToken = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    swapRouter = SWAPROUTER_GOERLI;
  } else if (network.name == "goerli") {
    // goerli
    stableCoin = USDC_GOERLI;
    wrappedNativeToken = WETH_GOERLI;
    swapRouter = SWAPROUTER_GOERLI;
  } else if (network.name == "hardhat") {
    // hardhat
    stableCoin = USDC_GOERLI;
    wrappedNativeToken = WETH_GOERLI;
    swapRouter = SWAPROUTER_GOERLI;
  } else if (network.name == "alfajores") {
    // alfajores
    stableCoin = "0x37f39aD164cBBf0Cc03Dd638472F3FbeC7aE426C";
    wrappedNativeToken = "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9";
    swapRouter = "0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121"; // Ubeswap
  } else {
    throw new Error("Network not supported");
  }

  const soulFactoryDeploymentResult = await deploy("SoulFactory", {
    from: deployer,
    args: [
      env.OWNER || owner.address,
      soulboundIdentityDeployed.address,
      "10000000", // 10 USDC, with 6 decimals
      network.name == "hardhat" || network.name == "goerli"
        ? CORN_GOERLI // CORN
        : corn.address,
      stableCoin,
      wrappedNativeToken,
      swapRouter,
      env.OWNER || owner.address
    ],
    log: true
  });

  // verify contract with etherscan, if its not a local network
  if (network.name == "mainnet" || network.name == "goerli") {
    try {
      await hre.run("verify:verify", {
        address: soulFactoryDeploymentResult.address,
        constructorArguments: [
          env.OWNER || owner.address,
          soulboundIdentityDeployed.address,
          "10000000", // 10 USDC, with 6 decimals
          CORN_GOERLI, // CORN
          stableCoin,
          wrappedNativeToken,
          swapRouter,
          env.OWNER || owner.address
        ]
      });
    } catch (error) {
      if (error.message != "Contract source code already verified") {
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

  const signer = env.OWNER
    ? new ethers.Wallet(
        getPrivateKey(network.name),
        ethers.getDefaultProvider(network.name)
      )
    : owner;

  // we set the registration prices per year and length of name
  const soulFactory = await ethers.getContractAt(
    "SoulFactory",
    soulFactoryDeploymentResult.address
  );
  await soulFactory
    .connect(signer)
    .setNameRegistrationPricePerYear(1, 50000000000); // 1 length, 50,000 USDC
  await soulFactory
    .connect(signer)
    .setNameRegistrationPricePerYear(2, 5000000000); // 2 length, 5,000 USDC
  await soulFactory
    .connect(signer)
    .setNameRegistrationPricePerYear(3, 1500000000); // 3 length, 1,500 USDC
  await soulFactory
    .connect(signer)
    .setNameRegistrationPricePerYear(4, 500000000); // 4 length, 500 USDC

  // we add soulFactory as soulboundIdentity and soulName minter

  const IDENTITY_MINTER_ROLE = await soulboundIdentity.MINTER_ROLE();
  await soulboundIdentity
    .connect(signer)
    .grantRole(IDENTITY_MINTER_ROLE, soulFactoryDeploymentResult.address);

  const NAME_MINTER_ROLE = await soulName.MINTER_ROLE();
  await soulName
    .connect(signer)
    .grantRole(NAME_MINTER_ROLE, soulFactoryDeploymentResult.address);
};

func.tags = ["SoulFactory"];
func.dependencies = ["CORN", "SoulboundIdentity", "SoulName"];
export default func;
