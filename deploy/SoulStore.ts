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
  const soulNameDeployed = await deployments.get("SoulName");

  if (
    network.name === "mainnet" ||
    network.name === "goerli" ||
    network.name === "hardhat" ||
    network.name === "celo" ||
    network.name === "alfajores"
  ) {
    // deploy contract
    const soulStoreDeploymentResult = await deploy("SoulStore", {
      from: deployer,
      args: [],
      log: true
    });

    const soulStore = await ethers.getContractAt(
      "SoulStore",
      soulStoreDeploymentResult.address
    );

    // initialize contract
    await soulStore.initialize(
      env.ADMIN || admin.address,
      soulboundIdentityDeployed.address,
      env.SOULNAME_PRICE_5LEN, // 5+ length price
      {
        swapRouter: env.SWAP_ROUTER,
        wrappedNativeToken: env.WETH_TOKEN,
        stableCoin: env.USDC_TOKEN,
        masaToken: env.MASA_TOKEN,
        reserveWallet: env.RESERVE_WALLET || admin.address
      }
    );

    // verify contract with etherscan, if its not a local network
    if (network.name !== "hardhat") {
      try {
        await hre.run("verify:verify", {
          address: soulStoreDeploymentResult.address,
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

    if (network.name === "hardhat" || network.name === "alfajores") {
      const soulboundIdentity = await ethers.getContractAt(
        "SoulboundIdentity",
        soulboundIdentityDeployed.address
      );
      const soulName = await ethers.getContractAt(
        "SoulName",
        soulNameDeployed.address
      );

      const signer = env.ADMIN
        ? new ethers.Wallet(getPrivateKey(network.name), ethers.provider)
        : admin;

      // we set the registration prices per year and length of name
      await soulStore
        .connect(signer)
        .setNameRegistrationPricePerYear(1, env.SOULNAME_PRICE_1LEN); // 1 length
      await soulStore
        .connect(signer)
        .setNameRegistrationPricePerYear(2, env.SOULNAME_PRICE_2LEN); // 2 length
      await soulStore
        .connect(signer)
        .setNameRegistrationPricePerYear(3, env.SOULNAME_PRICE_3LEN); // 3 length
      await soulStore
        .connect(signer)
        .setNameRegistrationPricePerYear(4, env.SOULNAME_PRICE_4LEN); // 4 length

      // add authority to soulStore
      await soulStore
        .connect(signer)
        .addAuthority(env.AUTHORITY_WALLET || admin.address);

      // we add soulStore as soulboundIdentity and soulName minter

      const IDENTITY_MINTER_ROLE = await soulboundIdentity.MINTER_ROLE();
      await soulboundIdentity
        .connect(signer)
        .grantRole(IDENTITY_MINTER_ROLE, soulStoreDeploymentResult.address);

      const NAME_MINTER_ROLE = await soulName.MINTER_ROLE();
      await soulName
        .connect(signer)
        .grantRole(NAME_MINTER_ROLE, soulStoreDeploymentResult.address);

      // we add payment methods
      env.PAYMENT_METHODS_SOULSTORE.split(" ").forEach(
        async (paymentMethod) => {
          await soulStore.connect(signer).enablePaymentMethod(paymentMethod);
        }
      );
    }
  }
};

func.skip = async ({ network }) => {
  return (
    network.name !== "mainnet" &&
    network.name !== "goerli" &&
    network.name !== "hardhat" &&
    network.name !== "celo" &&
    network.name !== "alfajores"
  );
};
func.tags = ["SoulStore"];
func.dependencies = ["SoulboundIdentity", "SoulName"];
export default func;
