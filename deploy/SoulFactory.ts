import { getEnvParams, getPrivateKey } from "../src/utils/EnvParams";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { DAI_RINKEBY } from "../src/constants";

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

  let stableCoin: string; // usdc
  let wrappedNativeToken: string; // weth
  let swapRouter: string;

  const chainId = await owner.getChainId();

  if (chainId == 1) {
    // mainnet
    stableCoin = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    wrappedNativeToken = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    swapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  } else if (chainId == 4) {
    // rinkeby
    stableCoin = "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b";
    wrappedNativeToken = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
    swapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  } else if (chainId == 31337) {
    // hardhat
    stableCoin = "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b";
    wrappedNativeToken = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
    swapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
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

  // we add soulFactory as soulboundIdentity minter
  const signer = env.OWNER
    ? new ethers.Wallet(
        getPrivateKey(network.name),
        ethers.getDefaultProvider(network.name)
      )
    : owner;

  const MINTER_ROLE = await soulboundIdentity.MINTER_ROLE();
  await soulboundIdentity
    .connect(signer)
    .grantRole(MINTER_ROLE, SoulFactoryDeploymentResult.address);
};

func.tags = ["SoulFactory"];
func.dependencies = ["CORN", "SoulboundIdentity", "SoulName"];
export default func;
