import { getEnvParams, getPrivateKey } from "../src/utils/EnvParams";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import {
  DAI_RINKEBY,
  SWAPROUTER_RINKEBY,
  USDC_RINKEBY,
  WETH_RINKEBY
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

  const chainId = await owner.getChainId();

  if (chainId == 1) {
    // mainnet
    stableCoin = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    wrappedNativeToken = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    swapRouter = SWAPROUTER_RINKEBY;
  } else if (chainId == 4) {
    // rinkeby
    stableCoin = USDC_RINKEBY;
    wrappedNativeToken = WETH_RINKEBY;
    swapRouter = SWAPROUTER_RINKEBY;
  } else if (chainId == 31337) {
    // hardhat
    stableCoin = USDC_RINKEBY;
    wrappedNativeToken = WETH_RINKEBY;
    swapRouter = SWAPROUTER_RINKEBY;
  } else if (chainId == 44787) {
    // alfajores
    stableCoin = "0x37f39aD164cBBf0Cc03Dd638472F3FbeC7aE426C";
    wrappedNativeToken = "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9";
    swapRouter = "0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121"; // Ubeswap
  } else {
    throw new Error("Network not supported");
  }

  const SoulFactoryDeploymentResult = await deploy("SoulFactory", {
    from: deployer,
    args: [
      env.OWNER || owner.address,
      soulboundIdentityDeployed.address,
      "5000000", // 5 USDC, with 6 decimals
      "3000000", // 3 USDC, with 6 decimals
      "3000000", // 3 USDC, with 6 decimals
      chainId == 31337 || chainId == 4
        ? DAI_RINKEBY // DAI
        : corn.address,
      stableCoin,
      wrappedNativeToken,
      swapRouter,
      env.OWNER || owner.address
    ],
    log: true
  });

  const soulboundIdentity = await ethers.getContractAt(
    "SoulboundIdentity",
    soulboundIdentityDeployed.address
  );
  const soulName = await ethers.getContractAt(
    "SoulName",
    soulNameDeployed.address
  );

  // we add soulFactory as soulboundIdentity and soulName minter
  const signer = env.OWNER
    ? new ethers.Wallet(
        getPrivateKey(network.name),
        ethers.getDefaultProvider(network.name)
      )
    : owner;

  const IDENTITY_MINTER_ROLE = await soulboundIdentity.MINTER_ROLE();
  await soulboundIdentity
    .connect(signer)
    .grantRole(IDENTITY_MINTER_ROLE, SoulFactoryDeploymentResult.address);

  const NAME_MINTER_ROLE = await soulName.MINTER_ROLE();
  await soulName
    .connect(signer)
    .grantRole(NAME_MINTER_ROLE, SoulFactoryDeploymentResult.address);
};

func.tags = ["SoulFactory"];
func.dependencies = ["CORN", "SoulboundIdentity", "SoulName"];
export default func;
