
import React from "react";
import { Button, Typography, Box, TextField, Alert, Paper } from "@mui/material";
import { mintHealthRecord } from "../contractService";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

// Funzione reale per upload su IPFS tramite backend Express
async function uploadFileToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('http://localhost:4000/api/upload', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Errore upload');
  return data.cid;
}

const Doctor: React.FC = () => {
  const { account, setAccount } = useWallet();
  const [to, setTo] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [patientId, setPatientId] = React.useState("");
  const [mintResult, setMintResult] = React.useState<{ txHash: string; tokenId: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [cartellaClinica, setCartellaClinica] = React.useState<any | null>(null);
  const navigate = useNavigate();

  // Funzione per logout
  const logout = () => {
    setAccount(null);
    navigate("/");
  };

  // Funzione per mintare NFT
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
  setError(null);
  setMintResult(null);
    setLoading(true);
    try {
      if (!file) throw new Error("Devi selezionare un file da caricare su IPFS");
      // Carica il file su IPFS e ottieni il CID
      const cid = await uploadFileToIPFS(file);
      // Chiama il mint passando il CID
  const result = await mintHealthRecord(to, cid, patientId);
  setMintResult(result);
   // Automatizza la modifica del JSON: aggiungi il tokenId
      // Supponiamo che il file sia stato caricato e parsato come oggetto
      // Se il file è JSON, lo puoi leggere così:
      if (file && file.type === "application/json") {
        const text = await file.text();
        try {
          const dati = JSON.parse(text);
          dati.tokenId = result.tokenId;
          setCartellaClinica(dati);
        } catch {}
      }
      setTo("");
      setFile(null);
      setFileName(null);
      setPatientId("");
    } catch (err: any) {
      setError(err.message || "Errore durante il mint");
    } finally {
      setLoading(false);
    }
  };

  // Gestione drag & drop
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setFileName(files[0].name);
      setFile(files[0]);
      setError(null);
    }
  };

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
        Dashboard Medico
      </Typography>
      <Typography variant="body1" gutterBottom>
        Qui puoi verificare NFT sanitari, visualizzare dati e validare prove ZKP.
      </Typography>
      {account && (
        <Box position="absolute" top={16} left={16} zIndex={10}>
          <Button variant="outlined" color="secondary" onClick={logout}>
            Logout
          </Button>
          <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={() => navigate("/doctor-records") }>
            Visualizza cartelle cliniche
          </Button>
        </Box>
      )}
      <Box mt={4} width={400}>
        {/* Area drag & drop file */}
        <Paper
          elevation={dragActive ? 8 : 2}
          sx={{
            p: 2,
            mb: 2,
            border: dragActive ? "2px solid #1976d2" : "2px dashed #aaa",
            textAlign: "center",
            background: dragActive ? "#e3f2fd" : "#fafafa",
            cursor: "pointer"
          }}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <Typography variant="body2">
            {fileName ? `File selezionato: ${fileName}` : "Trascina qui il file da caricare su IPFS"}
          </Typography>
        </Paper>
        <form onSubmit={handleMint}>
          <Typography variant="h6" gutterBottom>Mint nuovo record sanitario</Typography>
          <TextField
            label="Indirizzo paziente"
            value={to}
            onChange={e => setTo(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="ID paziente"
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" color="secondary" fullWidth disabled={loading || !account || !file} sx={{ mt: 2 }}>
            {loading ? "Caricamento/Mint in corso..." : "Mint NFT"}
          </Button>
        </form>
        {mintResult && (
          <Alert severity="success" sx={{ mt: 2 }}>
            NFT creato!<br />
            Tx: {mintResult.txHash}<br />
            TokenId: {mintResult.tokenId}
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>
    </Box>
  );
};

export default Doctor;
