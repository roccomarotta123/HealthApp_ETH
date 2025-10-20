
import React from "react";
import { Button, Typography, Box, List, ListItem, ListItemText, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import HealthRecordNFT from "../abi/HealthRecordNFT.json";

const Patient: React.FC = () => {
  const { account, setAccount } = useWallet();
  const navigate = useNavigate();
  const [records, setRecords] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Funzione per logout
  function logout() {
    setAccount(null);
    navigate("/");
  }

  // Recupera la cartella clinica direttamente da smart contract e IPFS
  React.useEffect(() => {
    const fetchRecords = async () => {
      if (!account) return;
      setLoading(true);
      setError(null);
      try {
        if (!window.ethereum) throw new Error("Wallet non trovato");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
        const contract = new ethers.Contract(CONTRACT_ADDRESS, HealthRecordNFT.abi, signer);
        // Verifica i token posseduti dall'account
        const ownedTokens: string[] = await contract.tokensOfOwner(account);
        // Recupera i CID dal contratto
        let cids: string[] = await contract.getAllMetadataCID(account);
        cids = [...new Set(cids)];
        if (cids.length === 0) {
          setRecords([]);
          setLoading(false);
          return;
        }
        // Recupera i tokenId associati ai CID
        const tokenIds = await Promise.all(
          cids.map(async (cid: string) => {
            try {
              const tokenId = await contract.getTokenIdByCID(cid);
              return tokenId;
            } catch {
              return null;
            }
          })
        );
        // Invia i CID al backend per recuperare i dati clinici
        const res = await fetch("http://localhost:4000/api/records/fetch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cids })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Errore nel recupero dei record");
        // Associa tokenId a ciascun record
        const recordsWithTokenId = data.records.map((rec: any, idx: number) => ({ ...rec, tokenId: tokenIds[idx] }));
        setRecords(recordsWithTokenId);
        // Estrai la data di nascita dalla prima cartella clinica e salvala in localStorage
        if (recordsWithTokenId.length > 0 && recordsWithTokenId[0].dob) {
          localStorage.setItem('dob', recordsWithTokenId[0].dob);
        }
      } catch (err: any) {
        setError(err.message || "Errore nel recupero dei record");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [account]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      width="100vw"
    >
      <Typography variant="h4" gutterBottom>
        Dashboard Paziente
      </Typography>
      <Typography variant="body1" gutterBottom>
        Qui potrai visualizzare i tuoi NFT sanitari.
      </Typography>
      {account && (
        <Box display="flex" gap={2} mb={4}>
          <Button variant="outlined" color="secondary" onClick={logout}>
            Logout
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate("/access-control") }>
            Gestione Permessi
          </Button>
        </Box>
      )}
      {/* Lista cartella clinica */}
      <Box mt={4} width={500}>
        <Typography variant="h6" gutterBottom>Cartella clinica</Typography>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && records.length === 0 && (
          <Typography>Nessuna cartella clinica.</Typography>
        )}
        {!loading && !error && records.length > 0 && (
          <List>
            {records.map((rec, idx) => (
              <ListItem key={idx} divider alignItems="flex-start">
                {rec.errore ? (
                  <ListItemText
                    primary={`Errore: ${rec.errore}`}
                    secondary={`CID: ${rec.cid}`}
                  />
                ) : (
                  <Box width="100%">
                    <Typography variant="subtitle1" fontWeight={600}>
                      {rec.name || `Paziente #${idx + 1}`}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <b>ID Paziente:</b> {rec.patientId || '-'}<br />
                      <b>Token ID:</b> {rec.tokenId !== undefined ? rec.tokenId : '-'}<br />
                      <b>Data di nascita:</b> {rec.dob || '-'}
                    </Typography>
                    {Array.isArray(rec.records) && rec.records.length > 0 && (
                      <Box mt={1}>
                        <Typography variant="subtitle2">Records clinici:</Typography>
                        <List dense>
                          {rec.records.map((r: any, i: number) => (
                            <ListItem key={i} sx={{ pl: 2 }} alignItems="flex-start">
                              <ListItemText
                                primary={`${r.type} (${r.date})`}
                                secondary={
                                  <>
                                    <span><b>Descrizione:</b> {r.description}</span><br />
                                    <span><b>Medico:</b> {r.doctor}</span>
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default Patient;
