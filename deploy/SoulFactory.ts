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

  [, admin] = await ethers.getSigners();
  const env = getEnvParams(network.name);

  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");
  const soulboundBaseSelfSovereignDeployed = await deployments.get(
    "SoulboundBaseSelfSovereign"
  );

  // deploy contract
  const soulFactoryDeploymentResult = await deploy("SoulFactory", {
    from: deployer,
    args: [],
    log: true
  });

  const soulFactory = await ethers.getContractAt(
    "SoulFactory",
    soulFactoryDeploymentResult.address
  );

  // initialize contract
  await soulFactory.initialize(
    env.ADMIN || admin.address,
    soulboundIdentityDeployed.address,
    soulboundBaseSelfSovereignDeployed.address,
    {
      swapRouter: env.SWAP_ROUTER,
      wrappedNativeToken: env.WETH_TOKEN,
      stableCoin: env.USDC_TOKEN,
      masaToken: env.MASA_TOKEN,
      reserveWallet: env.RESERVE_WALLET || admin.address
    }
  );

  // verify contract with etherscan, if its not a local network
  if (network.name == "mainnet" || network.name == "goerli") {
    try {
      await hre.run("verify:verify", {
        address: soulFactoryDeploymentResult.address,
        constructorArguments: []
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

  if (network.name == "hardhat") {
    const signer = env.ADMIN
      ? new ethers.Wallet(
          getPrivateKey(network.name),
          ethers.getDefaultProvider(network.name)
        )
      : admin;

    // we add payment methods
    env.PAYMENT_METHODS_SOULSTORE.split(" ").forEach(async (paymentMethod) => {
      await soulFactory.connect(signer).enablePaymentMethod(paymentMethod);
    });
  }
};

func.tags = ["SoulFactory"];
func.dependencies = ["SoulboundIdentity", "SoulboundBaseSelfSovereign"];
export default func;
