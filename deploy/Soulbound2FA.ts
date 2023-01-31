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
  const baseUri = `${env.BASE_URI}/2fa/`;

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

  if (network.name != "mainnet") {
    const soulbound2FADeploymentResult = await deploy("Soulbound2FA", {
      from: deployer,
      args: constructorArguments,
      log: true
      // nonce: currentNonce + 1 // to solve REPLACEMENT_UNDERPRICED, when needed
    });

    // verify contract with etherscan, if its not a local network
    if (network.name === "goerli") {
      try {
        await hre.run("verify:verify", {
          address: soulbound2FADeploymentResult.address,
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

      const soulbound2FA = await ethers.getContractAt(
        "Soulbound2FA",
        soulbound2FADeploymentResult.address
      );

      // add authority to soulbound2FA
      await soulbound2FA
        .connect(signer)
        .addAuthority(env.AUTHORITY_WALLET || admin.address);
    }
  }
};

func.skip = async ({ network }) => {
  return network.name === "mainnet";
};
func.tags = ["Soulbound2FA"];
func.dependencies = ["SoulboundIdentity"];
export default func;
