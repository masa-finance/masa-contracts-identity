import hre from "hardhat";
import { getEnvParams, getPrivateKey } from "../src/EnvParams";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
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

  [, admin] = await ethers.getSigners();
  const env = getEnvParams(network.name);

  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");
  const soulNameDeployed = await deployments.get("SoulName");

  const { swapRouter, wrappedNativeToken, stableCoin, masaCoin } =
    paymentParams(network.name, ethers);

  const constructorArguments = [
    env.ADMIN || admin.address,
    soulboundIdentityDeployed.address,
    "10000000", // 10 USDC, with 6 decimals
    [
      swapRouter,
      wrappedNativeToken,
      stableCoin,
      masaCoin,
      env.RESERVE_WALLET || admin.address
    ]
  ];

  const soulStoreDeploymentResult = await deploy("SoulStore", {
    from: deployer,
    args: constructorArguments,
    log: true
  });

  // verify contract with etherscan, if its not a local network
  if (network.name == "mainnet" || network.name == "goerli") {
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

  const soulboundIdentity = await ethers.getContractAt(
    "SoulboundIdentity",
    soulboundIdentityDeployed.address
  );
  const soulName = await ethers.getContractAt(
    "SoulName",
    soulNameDeployed.address
  );

  const signer = env.ADMIN
    ? new ethers.Wallet(
        getPrivateKey(network.name),
        ethers.getDefaultProvider(network.name)
      )
    : admin;

  // we set the registration prices per year and length of name
  const soulStore = await ethers.getContractAt(
    "SoulStore",
    soulStoreDeploymentResult.address
  );
  await soulStore
    .connect(signer)
    .setNameRegistrationPricePerYear(1, 6_250_000_000); // 1 length, 6,250 USDC USDC
  await soulStore
    .connect(signer)
    .setNameRegistrationPricePerYear(2, 1_250_000_000); // 2 length, 1,250 USDC
  await soulStore
    .connect(signer)
    .setNameRegistrationPricePerYear(3, 250_000_000); // 3 length, 250 USDC
  await soulStore
    .connect(signer)
    .setNameRegistrationPricePerYear(4, 50_000_000); // 4 length, 50 USDC

  // we add soulStore as soulboundIdentity and soulName minter

  const IDENTITY_MINTER_ROLE = await soulboundIdentity.MINTER_ROLE();
  await soulboundIdentity
    .connect(signer)
    .grantRole(IDENTITY_MINTER_ROLE, soulStoreDeploymentResult.address);

  const NAME_MINTER_ROLE = await soulName.MINTER_ROLE();
  await soulName
    .connect(signer)
    .grantRole(NAME_MINTER_ROLE, soulStoreDeploymentResult.address);

  if (network.name != "mainnet") {
    // we add payment methods
    await soulStore
      .connect(signer)
      .enablePaymentMethod(ethers.constants.AddressZero);
    await soulStore.connect(signer).enablePaymentMethod(USDC_GOERLI);
    await soulStore.connect(signer).enablePaymentMethod(MASA_GOERLI);
  }
};

func.tags = ["SoulStore"];
func.dependencies = ["SoulboundIdentity", "SoulName"];
export default func;
