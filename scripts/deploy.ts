// scripts/deploy.ts

import { ethers, upgrades } from "hardhat";
import type { HealthRecordNFT } from "../typechain-types/contracts/HealthRecordNFT";

async function main() {
  // Stampa la lista degli oracoli
  // ...existing code...
  console.log("Inizio del deployment del contratto HealthRecordNFT (Proxy UUPS)... 🚀");

  // Ottiene l'indirizzo che verrà utilizzato per il deployment
  const [deployer] = await ethers.getSigners();
  const deployerAddress = deployer.address;
  console.log(`Deploying con l'account: ${deployerAddress}`);

  // L'indirizzo che sarà l'admin iniziale del contratto (DEFAUL_ADMIN_ROLE e UPGRADER_ROLE).
  // In questo caso, usiamo lo stesso deployer.
  const adminAddress = deployerAddress;
  
  // 1. Deploy del contratto Verifier
  const VerifierFactory = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await VerifierFactory.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log(`Verifier (Groth16Verifier) deployato all'indirizzo: ${verifierAddress}`);

  // 2. Factory per l'Implementation Contract
  const HealthRecordNFTFactory = await ethers.getContractFactory("HealthRecordNFT");

  // 3. Deployment del Proxy e dell'Implementation Contract
  // Passa adminAddress e verifierAddress alla funzione initialize
  const healthRecordNFTProxy = await upgrades.deployProxy(
    HealthRecordNFTFactory, 
    [adminAddress, verifierAddress], // Argomenti per la funzione initialize(address admin, address verifier)
    { 
      kind: 'uups',
      initializer: 'initialize'
    }
  );

  // 3. Attesa della conferma del deployment
  await healthRecordNFTProxy.waitForDeployment();
  
  // 4. Ottenere l'indirizzo del contratto Proxy
  const proxyAddress = await healthRecordNFTProxy.getAddress();

  console.log("---");
  console.log(`Proxy Contract (HealthRecordNFT) deployato all'indirizzo: ${proxyAddress}`);
  console.log(`Admin Address (DEFAULT_ADMIN_ROLE, UPGRADER_ROLE): ${adminAddress}`);
  
  // Ottenere l'indirizzo del contratto di implementazione per la verifica
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log(`Implementation Contract (Logica) deployato all'indirizzo: ${implementationAddress}`);
  console.log("---");


  // tipizzazione del contratto per interazioni future
  const healthRecordNFT = healthRecordNFTProxy as unknown as HealthRecordNFT;

  // Esempio di interazione: Verificare il ruolo dell'admin
  const isAdmin = await healthRecordNFT.hasRole(
    await healthRecordNFT.DEFAULT_ADMIN_ROLE(), 
    adminAddress
  );
  console.log(`L'indirizzo deployer/admin ha il DEFAULT_ADMIN_ROLE: ${isAdmin}`);

  
  // Imposta la chiave privata dell'account 2 come oracolo
  const oraclePrivateKey = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
  const oracleWallet = new ethers.Wallet(oraclePrivateKey, ethers.provider);
  // Assegna l'ORACLE_ROLE solo all'indirizzo desiderato
  const oracleAddresses = [
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  ];
  const ORACLE_ROLE = await healthRecordNFT.ORACLE_ROLE();
  for (const oracleAddress of oracleAddresses) {
    const tx = await healthRecordNFT.grantRole(ORACLE_ROLE, oracleAddress);
    await tx.wait();
    console.log(`L'ORACLE_ROLE è stato assegnato all'indirizzo: ${oracleAddress}`);
    const isOracle = await healthRecordNFT.hasRole(ORACLE_ROLE, oracleAddress);
    console.log(`Indirizzo ${oracleAddress} ha ruolo ORACLE: ${isOracle}`);
  }

}

// Esecuzione dello script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});