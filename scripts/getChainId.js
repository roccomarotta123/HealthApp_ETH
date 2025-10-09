require("@nomicfoundation/hardhat-toolbox");

async function getChainId() {
  const chainIdHex = await ethers.provider.send("eth_chainId");
  const chainId = parseInt(chainIdHex, 16);
  console.log(`La Chain ID è: ${chainId}`);
}

getChainId()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
