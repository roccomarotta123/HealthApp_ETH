import { ethers } from "ethers";
import HealthRecordNFT from "./abi/HealthRecordNFT.json";

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Inserisci l'indirizzo del contratto dopo il deploy
const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

export const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask non trovata");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, HealthRecordNFT.abi, signer);
};

export const mintHealthRecord = async (
  to: string,
  metadataCID: string,
  patientId: string
) => {
  const contract = await getContract();
  // Chiama la funzione mintRecord del contratto
  const tx = await contract.mintRecord(to, metadataCID, patientId);
  const receipt = await tx.wait();
  // Recupera il tokenId dagli eventi MintedRecord
  let tokenId = null;
  for (const event of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(event);
      if (parsed && parsed.name === "MintedRecord") {
        tokenId = parsed.args.tokenId.toString();
        break;
      }
    } catch {}
  }
  return { txHash: tx.hash, tokenId };
};