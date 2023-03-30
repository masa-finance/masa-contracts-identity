import hre from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { getEnvParams, getPrivateKey } from "../src/EnvParams";

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

  // const currentNonce: number = await ethers.provider.getTransactionCount(deployer);
  // to solve REPLACEMENT_UNDERPRICED, when needed

  [, admin] = await ethers.getSigners();
  const env = getEnvParams(network.name);
  const baseUri = `${env.BASE_URI}/green/${network.name}/`;

  let soulboundIdentityDeployedAddress;
  if (
    network.name === "mainnet" ||
    network.name === "goerli" ||
    network.name === "hardhat"
  ) {
    const soulboundIdentityDeployed = await deployments.get(
      "SoulboundIdentity"
    );
    soulboundIdentityDeployedAddress = soulboundIdentityDeployed.address;
  } else {
    soulboundIdentityDeployedAddress = ethers.constants.AddressZero;
  }

  const constructorArguments = [
    env.ADMIN || admin.address,
    env.SOULBOUNDGREEN_NAME,
    env.SOULBOUNDGREEN_SYMBOL,
    baseUri,
    soulboundIdentityDeployedAddress,
    [
      env.SWAP_ROUTER,
      env.WETH_TOKEN,
      env.USDC_TOKEN,
      env.MASA_TOKEN,
      env.RESERVE_WALLET || admin.address
    ]
  ];

  const soulboundGreenDeploymentResult = await deploy("SoulboundGreen", {
    from: deployer,
    args: constructorArguments,
    log: true
    // nonce: currentNonce + 1 // to solve REPLACEMENT_UNDERPRICED, when needed
  });

  // verify contract with etherscan, if its not a local network or celo
  if (network.name !== "hardhat") {
    try {
      await hre.run("verify:verify", {
        address: soulboundGreenDeploymentResult.address,
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

  if (
    network.name === "hardhat" ||
    network.name === "alfajores" ||
    network.name === "bsctest" ||
    network.name === "mumbai"
  ) {
    const signer = env.ADMIN
      ? new ethers.Wallet(getPrivateKey(network.name), ethers.provider)
      : admin;

    const soulboundGreen = await ethers.getContractAt(
      "SoulboundGreen",
      soulboundGreenDeploymentResult.address
    );

    // add authority to soulboundGreen
    await soulboundGreen
      .connect(signer)
      .addAuthority(env.AUTHORITY_WALLET || admin.address);

    // add mint price to soulboundCreditScore
    await soulboundGreen
      .connect(signer)
      .setMintPrice(env.SOULBOUNDGREEN_MINTING_PRICE || 1000000); // 1 USDC

    // we add payment methods
    env.PAYMENT_METHODS_SOULBOUNDGREEN.split(" ").forEach(
      async (paymentMethod) => {
        await soulboundGreen.connect(signer).enablePaymentMethod(paymentMethod);
      }
    );
  }
};

func.tags = ["SoulboundGreen"];
func.dependencies = ["SoulboundIdentity"];
export default func;
