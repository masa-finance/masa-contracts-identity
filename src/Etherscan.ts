import hre from "hardhat";

export async function verifyOnEtherscan(
  address: string,
  constructorArguments: any[]
) {
  try {
    await hre.run("verify:verify", {
      address: address,
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
