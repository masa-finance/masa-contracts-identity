module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy } = deployments;
  const { deployer, owner } = await getNamedAccounts();

  const soulBoundTokenDeploymentResult = await deploy("SoulBoundIdentity", {
    from: deployer,
    args: [owner],
    log: true,
  });

  await ethers.getContractAt(
    "SoulBoundIdentity",
    soulBoundTokenDeploymentResult.address
  );
};

module.exports.tags = ["SoulBoundIdentity"];
