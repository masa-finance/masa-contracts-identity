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

  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");

  const { swapRouter, wrappedNativeToken, stableCoin, masaCoin } =
    paymentParams(network.name, ethers);

  const constructorArguments = [
    env.ADMIN || admin.address,
    soulboundIdentityDeployed.address,
    [
      swapRouter,
      wrappedNativeToken,
      stableCoin,
      masaCoin,
      env.RESERVE_WALLET || admin.address
    ]
  ];

  const soulLinkerDeploymentResult = await deploy("SoulLinker", {
    from: deployer,
    args: constructorArguments,
    log: true
    // nonce: currentNonce + 1 // to solve REPLACEMENT_UNDERPRICED, when needed
  });

  // verify contract with etherscan, if its not a local network
  if (network.name == "mainnet" || network.name == "goerli") {
    verifyOnEtherscan(soulLinkerDeploymentResult.address, constructorArguments);
  }

  if (network.name == "hardhat") {
    // we add payment methods

    const signer = env.ADMIN
      ? new ethers.Wallet(
          getPrivateKey(network.name),
          ethers.getDefaultProvider(network.name)
        )
      : admin;

    const soulLinker = await ethers.getContractAt(
      "SoulLinker",
      soulLinkerDeploymentResult.address
    );

    env.PAYMENT_METHODS_SOULLINKER.split(" ").forEach(async (paymentMethod) => {
      await soulLinker.connect(signer).enablePaymentMethod(paymentMethod);
    });
  }
};

func.tags = ["SoulLinker"];
func.dependencies = [
  "SoulboundIdentity",
  "SoulboundCreditScore",
  "Soulbound2FA"
];
export default func;
