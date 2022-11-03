import hre from "hardhat";
import { getEnvParams, getPrivateKey } from "../src/utils/EnvParams";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { MASA_GOERLI, SWAPROUTER_GOERLI, WETH_GOERLI } from "../src/constants";

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

  // const currentNonce: number = await ethers.provider.getTransactionCount(deployer);
  // to solve REPLACEMENT_UNDERPRICED, when needed

  [, owner] = await ethers.getSigners();
  const env = getEnvParams(network.name);

  const masa = await deployments.get("MASA");
  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");
  const soulboundCreditReportDeployed = await deployments.get(
    "SoulboundCreditReport"
  );
  const soulbound2FADeployed = await deployments.get("Soulbound2FA");

  let wrappedNativeToken: string; // weth
  let swapRouter: string;

  if (network.name == "mainnet") {
    // mainnet
    wrappedNativeToken = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    swapRouter = SWAPROUTER_GOERLI;
  } else if (network.name == "goerli") {
    // goerli
    wrappedNativeToken = WETH_GOERLI;
    swapRouter = SWAPROUTER_GOERLI;
  } else if (network.name == "hardhat") {
    // hardhat
    wrappedNativeToken = WETH_GOERLI;
    swapRouter = SWAPROUTER_GOERLI;
  } else if (network.name == "alfajores") {
    // alfajores
    wrappedNativeToken = "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9";
    swapRouter = "0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121"; // Ubeswap
  } else {
    throw new Error("Network not supported");
  }

  const constructorArguments = [
    env.OWNER || owner.address,
    soulboundIdentityDeployed.address,
    "1000000", // 1 USDC, with 6 decimals
    network.name == "hardhat" || network.name == "goerli"
      ? MASA_GOERLI // MASA
      : masa.address,
    wrappedNativeToken,
    swapRouter,
    env.RESERVE_WALLET || owner.address
  ];

  const soulLinkerDeploymentResult = await deploy("SoulLinker", {
    from: deployer,
    args: constructorArguments,
    log: true
    // nonce: currentNonce + 1 // to solve REPLACEMENT_UNDERPRICED, when needed
  });

  // verify contract with etherscan, if its not a local network
  if (network.name == "mainnet" || network.name == "goerli") {
    try {
      await hre.run("verify:verify", {
        address: soulLinkerDeploymentResult.address,
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

  const signer = env.OWNER
    ? new ethers.Wallet(
        getPrivateKey(network.name),
        ethers.getDefaultProvider(network.name)
      )
    : owner;

  const soulLinker = await ethers.getContractAt(
    "SoulLinker",
    soulLinkerDeploymentResult.address
  );

  await soulLinker
    .connect(signer)
    .addLinkedSBT(soulboundCreditReportDeployed.address);

  await soulLinker.connect(signer).addLinkedSBT(soulbound2FADeployed.address);
};

func.tags = ["SoulLinker"];
func.dependencies = [
  "SoulboundIdentity",
  "SoulboundCreditReport",
  "Soulbound2FA"
];
export default func;
