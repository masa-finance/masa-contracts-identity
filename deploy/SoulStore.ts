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

  const constructorArguments = [
    env.ADMIN || admin.address,
    soulboundIdentityDeployed.address,
    env.SOULNAME_PRICE_5LEN, // 5+ length price
    [
      env.SWAP_ROUTER,
      env.WETH_TOKEN,
      env.USDC_TOKEN,
      env.MASA_TOKEN,
      env.TREASURY_WALLET || admin.address
    ]
  ];

  if (
    network.name === "mainnet" ||
    network.name === "goerli" ||
    network.name === "hardhat" ||
    network.name === "celo" ||
    network.name === "alfajores" ||
    network.name === "basegoerli"
  ) {
    const soulStoreDeploymentResult = await deploy("SoulStore", {
      from: deployer,
      args: constructorArguments,
      log: true
    });

    // verify contract with etherscan, if its not a local network or celo
    if (network.name !== "hardhat" && network.name !== "basegoerli") {
      try {
        await hre.run("verify:verify", {
          address: soulStoreDeploymentResult.address,
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
      network.name === "basegoerli"
    ) {
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
      const soulStore = await ethers.getContractAt(
        "SoulStore",
        soulStoreDeploymentResult.address
      );
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

      // add authorities to soulStore
      const authorities = (env.AUTHORITY_WALLET || admin.address).split(" ");
      for (let i = 0; i < authorities.length; i++) {
        await soulStore.connect(signer).addAuthority(authorities[i]);
      }

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
      const paymentMethods = env.PAYMENT_METHODS_SOULSTORE.split(" ");
      for (let i = 0; i < paymentMethods.length; i++) {
        await soulStore.connect(signer).enablePaymentMethod(paymentMethods[i]);
      }
    }
  }
};

func.skip = async ({ network }) => {
  return (
    network.name !== "mainnet" &&
    network.name !== "goerli" &&
    network.name !== "hardhat" &&
    network.name !== "celo" &&
    network.name !== "alfajores" &&
    network.name !== "basegoerli"
  );
};
func.tags = ["SoulStore"];
func.dependencies = ["SoulboundIdentity", "SoulName"];
export default func;
