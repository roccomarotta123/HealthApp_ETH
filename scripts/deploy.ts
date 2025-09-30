// scripts/deploy.ts

import { ethers, upgrades } from "hardhat";
import { HealthRecordNFT } from "../typechain-types"; // Assicurati che typechain sia in esecuzione

async function main() {
  console.log("Inizio del deployment del contratto HealthRecordNFT (Proxy UUPS)... 🚀");

  // Ottiene l'indirizzo che verrà utilizzato per il deployment
  const [deployer] = await ethers.getSigners();
  const deployerAddress = deployer.address;
  console.log(`Deploying con l'account: ${deployerAddress}`);

  // L'indirizzo che sarà l'admin iniziale del contratto (DEFAUL_ADMIN_ROLE e UPGRADER_ROLE).
  // In questo caso, usiamo lo stesso deployer.
  const adminAddress = deployerAddress;
  
  // 1. Factory per l'Implementation Contract
  // Nota: `getContractFactory` viene utilizzato con `upgrades.deployProxy`.
  const HealthRecordNFTFactory = await ethers.getContractFactory("HealthRecordNFT");

  // 2. Deployment del Proxy e dell'Implementation Contract
  // `deployProxy` gestisce:
  //   a) Il deployment del contratto di implementazione (logica).
  //   b) Il deployment del contratto Proxy (stato).
  //   c) La chiamata a `initialize(adminAddress)` sul proxy.
  const healthRecordNFTProxy = await upgrades.deployProxy(
    HealthRecordNFTFactory, 
    [adminAddress], // Argomenti per la funzione initialize(address admin)
    { 
      kind: 'uups', // Specifica che il tipo di proxy è UUPS
      initializer: 'initialize' // Specifica il nome della funzione di inizializzazione
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

  
  // In questo esempio si assegna l'oracle role allo stesso deployer del contratto
  const ORACLE_ROLE = await healthRecordNFT.ORACLE_ROLE();
  
  // Nota: solo l'admin (deployer) può assegnare un ruolo.
  const tx = await healthRecordNFT.grantRole(ORACLE_ROLE, adminAddress);
  await tx.wait();
  
  console.log(`L'ORACLE_ROLE è stato assegnato all'indirizzo: ${adminAddress}`);

}

// Esecuzione dello script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});