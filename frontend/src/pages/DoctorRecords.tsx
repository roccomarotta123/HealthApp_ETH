import React, { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, Alert, Button } from "@mui/material";
import { ethers } from "ethers";
import HealthRecordNFT from "../abi/HealthRecordNFT.json";
import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";

const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

const DoctorRecords: React.FC = () => {
  const { account } = useWallet();
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!account || !window.ethereum) return;
      setLoading(true);
      setError(null);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, HealthRecordNFT.abi, signer);
        // Recupera tutti i tokenId che hanno dato accesso al dottore
        const filter = contract.filters.AccessGranted(null, account);
        const events = await contract.queryFilter(filter);
        const tokenIds = events.map((e: any) => e.args.tokenId);
        // Recupera i metadati delle cartelle cliniche
        const recordsData = await Promise.all(tokenIds.map(async (tid: any) => {
          try {
            const cid = await contract.tokenMetadataCID(tid);
            // Qui puoi aggiungere una fetch al backend/IPFS per recuperare i dati clinici
            return { tokenId: tid, cid };
          } catch {
            return null;
          }
        }));
        setRecords(recordsData.filter(Boolean));
      } catch (err: any) {
        setError(err.message || "Errore nel recupero delle cartelle cliniche");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [account]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" width="100vw">
      <Typography variant="h4" gutterBottom>Cartelle cliniche accessibili</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && records.length === 0 && (
        <Typography>Nessuna cartella clinica disponibile.</Typography>
      )}
      {!loading && !error && records.length > 0 && (
        <List>
          {records.map((rec, idx) => (
            <ListItem key={idx} divider>
              <ListItemText
                primary={`Token ID: ${rec.tokenId}`}
                secondary={`CID: ${rec.cid}`}
              />
            </ListItem>
          ))}
        </List>
      )}
      <Button variant="outlined" color="secondary" sx={{ mt: 4 }} onClick={() => navigate(-1)}>
        Torna indietro
      </Button>
    </Box>
  );
};

export default DoctorRecords;
