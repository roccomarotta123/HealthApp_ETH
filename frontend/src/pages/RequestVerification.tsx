import React from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { getContract } from '../contractService';

const RequestVerification: React.FC = () => {
  const { account } = useWallet();
  const [patient, setPatient] = React.useState('');
  const [txHash, setTxHash] = React.useState<string | null>(null);
  const [requiredYear, setRequiredYear] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTxHash(null);
  if (!account) return setError('Connettiti con il wallet prima di procedere');
  if (!patient) return setError('Inserisci l\'indirizzo del paziente');
  if (!requiredYear) return setError('Specifica l\'anno richiesto');
    setLoading(true);
    try {
  const contract = await getContract();
  // L'evento sul contract è AgeVerificationRequested(address patient, address doctor, uint256 requiredYear)
  const tx = await contract.requestAgeVerification(patient, requiredYear);
  await tx.wait();
  setTxHash(tx.hash);
    } catch (err: any) {
      setError(err?.message || 'Errore durante la richiesta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" width="100vw" position="relative">
      {/* Bottone in alto a destra */}
      <Box position="absolute" top={16} right={32} zIndex={10}>
        <Button variant="outlined" color="primary" onClick={() => navigate('/verifiche-stato')}>
          Stato Verifiche
        </Button>
      </Box>
      <Box sx={{ width: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h4" gutterBottom>Richiedi verifica età</Typography>
        <Typography variant="body1" gutterBottom>Invia una richiesta al paziente per fornire una ZKP che dimostri il requisito di età.</Typography>
        <Box component="form" onSubmit={handleRequest} sx={{ width: '100%', mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <TextField label="Indirizzo paziente" value={patient} onChange={e => setPatient(e.target.value)} fullWidth required />
    <TextField label="Anno richiesto" type="number" value={requiredYear} onChange={e => setRequiredYear(e.target.value)} fullWidth required sx={{ mt: 2 }} />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, width: '100%' }} disabled={loading}>{loading ? 'Inviando...' : 'Invia richiesta'}</Button>
          <Button variant="text" sx={{ mt: 1, width: '100%' }} onClick={() => navigate('/doctor')}>Indietro</Button>
          {txHash && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>Richiesta inviata. Tx: {txHash}<br/>Anno richiesto: {requiredYear}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        </Box>
      </Box>
    </Box>
  );
};

export default RequestVerification;
