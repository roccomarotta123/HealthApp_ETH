const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const HealthRecordNFT = await ethers.getContractFactory("HealthRecordNFT");
  const contract = await upgrades.deployProxy(HealthRecordNFT, [deployer.address], {
    initializer: "initialize",
  });

  await contract.deployed();
  console.log("Proxy deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
