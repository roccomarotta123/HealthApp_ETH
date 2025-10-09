import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { ethers } from "ethers";
import HealthRecordNFT from "../abi/HealthRecordNFT.json";
import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";

const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

const AccessControl: React.FC = () => {
  const navigate = useNavigate();
  const { account } = useWallet();
  const [tokenId, setTokenId] = useState("");
  const [grantee, setGrantee] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ownedTokens, setOwnedTokens] = useState<string[]>([]);

  // Recupera i token posseduti dal paziente
  const fetchTokens = async () => {
    if (!account || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, HealthRecordNFT.abi, signer);
      // Recupera direttamente gli ID dei token posseduti
      const tokenIds = await contract.tokensOfOwner(account);
      setOwnedTokens(tokenIds.map((tid: any) => tid.toString()));
    } catch {}
  };

  React.useEffect(() => {
    fetchTokens();
  }, [account]);

  // Funzione per aggiornare i token quando si apre il menu
  const handleMenuOpen = () => {
    if (account) fetchTokens();
  };

  const handleGrant = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      if (!window.ethereum) throw new Error("Wallet non trovato");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, HealthRecordNFT.abi, signer);
      const tx = await contract.grantAccess(tokenId, grantee);
      await tx.wait();
      setMessage("Accesso CONCESSO con successo!");
    } catch (err: any) {
      setError(err.message || "Errore nella concessione del permesso");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      if (!window.ethereum) throw new Error("Wallet non trovato");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, HealthRecordNFT.abi, signer);
      const tx = await contract.revokeAccess(tokenId, grantee);
      await tx.wait();
      setMessage("Accesso REVOCATO con successo!");
    } catch (err: any) {
      setError(err.message || "Errore nella revoca del permesso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" width="100vw">
      <Box position="absolute" top={16} left={16} zIndex={10}>
        <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
          Torna indietro
        </Button>
      </Box>
      <Typography variant="h4" gutterBottom>Gestione Permessi Cartelle Cliniche</Typography>
      <Box mt={4} width={400}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="token-select-label">Seleziona Cartella Clinica</InputLabel>
          <Select
            labelId="token-select-label"
            value={tokenId}
            label="Seleziona Cartella Clinica"
            onChange={e => setTokenId(e.target.value as string)}
            onOpen={handleMenuOpen}
          >
            {ownedTokens.length === 0 && (
              <MenuItem value="" disabled>Nessuna cartella clinica disponibile</MenuItem>
            )}
            {ownedTokens.map(tid => (
              <MenuItem key={tid} value={tid}>Cartella clinica #{tid}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Indirizzo Ethereum destinatario"
          fullWidth
          margin="normal"
          value={grantee}
          onChange={e => setGrantee(e.target.value)}
        />
        <Box display="flex" gap={2} mt={2}>
          <Button variant="contained" color="primary" onClick={handleGrant} disabled={loading || !tokenId || !grantee}>
            Concedi Accesso
          </Button>
          <Button variant="contained" color="secondary" onClick={handleRevoke} disabled={loading || !tokenId || !grantee}>
            Revoca Accesso
          </Button>
        </Box>
        {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>
    </Box>
  );
};

export default AccessControl;
