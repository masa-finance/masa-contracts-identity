import hre from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { getEnvParams, getPrivateKey } from "../src/EnvParams";
import { verifyOnEtherscan } from "../src/Etherscan";
import { paymentParams } from "../src/PaymentParams";
import { MASA_GOERLI, USDC_GOERLI } from "../src/Constants";

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
  const baseUri = `${env.BASE_URI}/credit-score/`;

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

  const soulboundCreditScoreDeploymentResult = await deploy(
    "SoulboundCreditScore",
    {
      from: deployer,
      args: constructorArguments,
      log: true
      // nonce: currentNonce + 1 // to solve REPLACEMENT_UNDERPRICED, when needed
    }
  );

  // verify contract with etherscan, if its not a local network
  if (network.name == "mainnet" || network.name == "goerli") {
    verifyOnEtherscan(
      soulboundCreditScoreDeploymentResult.address,
      constructorArguments
    );
  }

  const signer = env.ADMIN
    ? new ethers.Wallet(
        getPrivateKey(network.name),
        ethers.getDefaultProvider(network.name)
      )
    : admin;

  const soulboundCreditScore = await ethers.getContractAt(
    "SoulboundCreditScore",
    soulboundCreditScoreDeploymentResult.address
  );

  // add authority to soulboundCreditScore
  await soulboundCreditScore
    .connect(signer)
    .addAuthority(env.AUTHORITY_WALLET || admin.address);

  if (network.name != "mainnet") {
    // we add payment methods
    await soulboundCreditScore
      .connect(signer)
      .enablePaymentMethod(ethers.constants.AddressZero);
    await soulboundCreditScore.connect(signer).enablePaymentMethod(USDC_GOERLI);
    await soulboundCreditScore.connect(signer).enablePaymentMethod(MASA_GOERLI);
  }
};

func.tags = ["SoulboundCreditScore"];
func.dependencies = ["SoulboundIdentity"];
export default func;
