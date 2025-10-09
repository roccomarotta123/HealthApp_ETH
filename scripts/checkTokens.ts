import hardhat from "hardhat";
const { ethers } = hardhat;

const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"; // Sostituisci con la chiave privata dell'account da controllare

async function main() {
  // Crea il wallet con la chiave privata
  const provider = ethers.provider;
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const account = await wallet.getAddress();
  const contract = await ethers.getContractAt("HealthRecordNFT", CONTRACT_ADDRESS, wallet);

  const tokens = await contract.tokensOfOwner(account);
  console.log("Token posseduti:", tokens);

  const cids = await contract.getAllMetadataCID(account);
  console.log("CID posseduti:", cids);
}

main().catch(console.error);
