import hre from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { getEnvParams, getPrivateKey } from "../src/EnvParams";
import { verifyOnEtherscan } from "../src/Etherscan";
import { paymentParams } from "../src/PaymentParams";

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
  const baseUri = `${env.BASE_URI}/2fa/`;

  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");

  const { swapRouter, wrappedNativeToken, stableCoin, masaCoin } =
    paymentParams(network.name, ethers);

  const constructorArguments = [
    env.ADMIN || admin.address,
    baseUri,
    soulboundIdentityDeployed.address,
    [
      swapRouter,
      wrappedNativeToken,
      stableCoin,
      masaCoin,
      env.RESERVE_WALLET || admin.address
    ]
  ];

  let soulbound2FADeploymentResult;
  if (network.name != "mainnet") {
    soulbound2FADeploymentResult = await deploy("Soulbound2FA", {
      from: deployer,
      args: constructorArguments,
      log: true
      // nonce: currentNonce + 1 // to solve REPLACEMENT_UNDERPRICED, when needed
    });
  }

  // verify contract with etherscan, if its not a local network
  if (network.name == "goerli") {
    verifyOnEtherscan(
      soulbound2FADeploymentResult.address,
      constructorArguments
    );
  }

  if (network.name != "mainnet") {
    const signer = env.ADMIN
      ? new ethers.Wallet(
          getPrivateKey(network.name),
          ethers.getDefaultProvider(network.name)
        )
      : admin;

    const soulbound2FA = await ethers.getContractAt(
      "Soulbound2FA",
      soulbound2FADeploymentResult.address
    );

    // add authority to soulbound2FA
    await soulbound2FA
      .connect(signer)
      .addAuthority(env.AUTHORITY_WALLET || admin.address);
  }
};

func.skip = async ({ network }) => {
  return network.name === "mainnet";
};
func.tags = ["Soulbound2FA"];
func.dependencies = ["SoulboundIdentity"];
export default func;
