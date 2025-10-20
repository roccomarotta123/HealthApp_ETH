import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert, MenuItem, Select, InputLabel, FormControl, IconButton, Badge, Menu, ListItem, ListItemText, Dialog, DialogTitle, DialogContent } from "@mui/material";
import NotificationsIcon from '@mui/icons-material/Notifications';
import { ethers } from "ethers";
import { poseidon2 } from 'poseidon-lite';
import * as snarkjs from 'snarkjs';
import HealthRecordNFT from "../abi/HealthRecordNFT.json";
import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";
const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

const AccessControl: React.FC = () => {
  // Stato notifiche e menu
  const [notifications, setNotifications] = useState<any[]>([]);
  const [proofResult, setProofResult] = useState<any | null>(null);
  const [proofOpen, setProofOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Gestione apertura/chiusura menu notifiche
  const handleBellClick = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    // Recupera eventi AgeVerificationRequested per il paziente loggato
    if (!account || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, HealthRecordNFT.abi, provider);
      // Recupera tutte le richieste di verifica per il paziente
      const filterRequested = contract.filters.AgeVerificationRequested(account, null, null);
      const eventsRequested = await contract.queryFilter(filterRequested);
      // Recupera tutti i risultati di verifica per il paziente
      const filterResult = contract.filters.AgeVerificationResult(null, account, null, null);
      const eventsResult = await contract.queryFilter(filterResult);
      // Costruisci lista di risultati già completati
      const completed = eventsResult.map(ev => {
        if ('args' in ev && ev.args) {
          const { doctor, user, requiredYear } = ev.args;
          return {
            doctor: doctor.toLowerCase(),
            user: user.toLowerCase(),
            anno: requiredYear.toString()
          };
        }
        return null;
      }).filter(Boolean);
      // Popola notifiche solo per richieste non ancora completate
      const newNotifications = eventsRequested.map((ev, idx) => {
        if (!('args' in ev) || !ev.args) return null;
        const { doctor, requiredYear } = ev.args;
        const doctorShort = typeof doctor === 'string' ? `${doctor.slice(0, 6)}...${doctor.slice(-4)}` : doctor;
        // Se esiste già un risultato per questa richiesta, non mostrare la notifica
        const isCompleted = completed.some(r => r && r.doctor === doctor.toLowerCase() && r.user === account.toLowerCase() && r.anno === requiredYear.toString());
        if (isCompleted) return null;
        return {
          id: idx + 1,
          type: "verifica_eta",
          message: `Richiesta verifica età da ${doctorShort}`,
          requiredYear: requiredYear.toString(),
          doctor: doctor
        };
      }).filter(Boolean);
      setNotifications(newNotifications);
    } catch {}
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
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
      {/* Campanella notifiche */}
      <Box position="absolute" top={16} right={16} zIndex={10}>
        <IconButton color="primary" onClick={handleBellClick}>
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          {notifications.length === 0 ? (
            <ListItem><ListItemText primary="Nessuna notifica" /></ListItem>
          ) : (
            notifications.map((notif) => (
              <ListItem key={notif.id}>
                <ListItemText primary={notif.message} secondary={`Anno richiesto: ${notif.requiredYear}`} />
                <Button variant="contained" color="primary" size="small" sx={{ ml: 2 }} onClick={async () => {
                  // Recupera anno di nascita da localStorage
                  let yearOfBirth = 1990;
                  const dob = localStorage.getItem('dob');
                  if (dob) {
                    const year = parseInt(dob.split('-')[0], 10);
                    if (!isNaN(year)) yearOfBirth = year;
                  }
                  console.log('Anno di nascita usato per la ZKP:', yearOfBirth);
                  const salt = 123456;      // TODO: recupera/genera salt associato
                  const requiredYear = Number(notif.requiredYear);
                  // Calcola commitment con poseidon-lite
                  const commitment = poseidon2([yearOfBirth, salt]).toString();
                  // Prepara input
                  const input = { yearOfBirth, salt, requiredYear, commitment };
                  // Usa fullProve per generare witness e proof direttamente
                  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                    input,
                    '/age_proof.wasm',
                    '/circuit_final.zkey'
                  );
                  // Chiamata a accessWithProof sullo smart contract
                  if (!window.ethereum) throw new Error("Wallet non trovato");
                  const provider = new ethers.BrowserProvider(window.ethereum);
                  const signer = await provider.getSigner();
                  const contract = new ethers.Contract(CONTRACT_ADDRESS, HealthRecordNFT.abi, signer);
                  // Adatta publicSignals per la chiamata (deve essere array di uint256, es: [publicSignals[0]])
                  // Conversione per compatibilità ethers/solidity
                  const toHex = (v: string | number | bigint) => {
                    if (typeof v === 'string' && v.startsWith('0x')) return v;
                    if (typeof v === 'number') return '0x' + v.toString(16);
                    return '0x' + BigInt(v).toString(16);
                  };
                  const a = [toHex(proof.pi_a[0]), toHex(proof.pi_a[1])];
                  const b = [
                    [toHex(proof.pi_b[0][1]), toHex(proof.pi_b[0][0])],
                    [toHex(proof.pi_b[1][1]), toHex(proof.pi_b[1][0])]
                  ];
                  const c = [toHex(proof.pi_c[0]), toHex(proof.pi_c[1])];
                  const publicInputs = publicSignals.map((v) => toHex(v));
                  await contract.accessWithProof(
                    a,
                    b,
                    c,
                    publicInputs,
                    notif.doctor,
                    requiredYear
                  );
                  setProofResult({ proof, publicSignals, commitment });
                  setProofOpen(true);
                  setMessage('Verifica effettuata con successo!');
                  setNotifications(notifications.filter(n => n.id !== notif.id));
                }}>Verifica</Button>
      {/* Dialog per mostrare la proof generata */}
      <Dialog open={proofOpen} onClose={() => setProofOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Proof ZKP generata</DialogTitle>
        <DialogContent>
          {proofResult && (
            <pre style={{ fontSize: 12 }}>{JSON.stringify(proofResult, null, 2)}</pre>
          )}
        </DialogContent>
      </Dialog>
              </ListItem>
            ))
          )}
        </Menu>
      </Box>
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
