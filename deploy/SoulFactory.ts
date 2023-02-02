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

  const constructorArguments = [
    env.ADMIN || admin.address,
    soulboundIdentityDeployed.address,
    soulboundBaseSelfSovereignDeployed.address,
    [
      env.SWAP_ROUTER,
      env.WETH_TOKEN,
      env.USDC_TOKEN,
      env.MASA_TOKEN,
      env.RESERVE_WALLET || admin.address
    ]
  ];

  const soulFactoryDeploymentResult = await deploy("SoulFactory", {
    from: deployer,
    args: constructorArguments,
    log: true
  });

  // verify contract with etherscan, if its not a local network
  if (network.name == "mainnet" || network.name == "goerli") {
    try {
      await hre.run("verify:verify", {
        address: soulFactoryDeploymentResult.address,
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

  if (network.name == "hardhat") {
    const signer = env.ADMIN
      ? new ethers.Wallet(
          getPrivateKey(network.name),
          ethers.getDefaultProvider(network.name)
        )
      : admin;

    const soulFactory = await ethers.getContractAt(
      "SoulFactory",
      soulFactoryDeploymentResult.address
    );

    // we add payment methods
    env.PAYMENT_METHODS_SOULSTORE.split(" ").forEach(async (paymentMethod) => {
      await soulFactory.connect(signer).enablePaymentMethod(paymentMethod);
    });
  }
};

func.tags = ["SoulFactory"];
func.dependencies = ["SoulboundIdentity", "SoulboundBaseSelfSovereign"];
export default func;
