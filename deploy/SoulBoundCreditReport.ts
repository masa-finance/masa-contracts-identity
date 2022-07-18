module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy } = deployments;
  const { deployer, owner } = await getNamedAccounts();

  const soulBoundTokenDeploymentResult = await deploy("SoulBoundCreditReport", {
    from: deployer,
    args: [owner],
    log: true,
  });

  await ethers.getContractAt(
    "SoulBoundCreditReport",
    soulBoundTokenDeploymentResult.address
  );
};

module.exports.tags = ["SoulBoundCreditReport"];
