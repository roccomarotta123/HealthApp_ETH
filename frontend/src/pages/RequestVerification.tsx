import React from 'react';
import { Box, Typography, TextField, Button, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { getContract } from '../contractService';

const RequestVerification: React.FC = () => {
  const { account } = useWallet();
  const [patient, setPatient] = React.useState('');
  const [txHash, setTxHash] = React.useState<string | null>(null);
  const [requiredYear, setRequiredYear] = React.useState<string>("");
  const [requiredMonth, setRequiredMonth] = React.useState<string>("");
  const [requiredDay, setRequiredDay] = React.useState<string>("");
  const [ageLimit, setAgeLimit] = React.useState<string>("");
  const allowedAgeLimits = [14, 16, 18, 21];
  // Calcola la data limite quando cambia il limite di età
  React.useEffect(() => {
    if (!ageLimit) {
      setRequiredYear("");
      setRequiredMonth("");
      setRequiredDay("");
      return;
    }
    const now = new Date();
    const year = now.getUTCFullYear() - parseInt(ageLimit);
    const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = now.getUTCDate().toString().padStart(2, '0');
    setRequiredYear(year.toString());
    setRequiredMonth(month);
    setRequiredDay(day);
  }, [ageLimit]);

  // Rimossa la logica di calcolo data limite
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  // handleRequest: chiama direttamente il contratto dal frontend
  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTxHash(null);
    if (!account) return setError('Connettiti con il wallet prima di procedere');
    if (!patient) return setError('Inserisci l\'indirizzo del paziente');
  if (!ageLimit) return setError('Seleziona il limite di età');
  if (!requiredYear || !requiredMonth || !requiredDay) return setError('Errore nel calcolo della data limite');
    setLoading(true);
    try {
      const contract = await getContract();
      // Invia anche la data limite calcolata
      const tx = await contract.requestAgeVerification(
        patient,
        account,
        Number(ageLimit),
        Number(requiredYear),
        Number(requiredMonth),
        Number(requiredDay)
      );
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
    <FormControl fullWidth required sx={{ mt: 2 }}>
      <InputLabel id="age-limit-label">Limite di età</InputLabel>
      <Select
        labelId="age-limit-label"
        value={ageLimit}
        label="Limite di età"
        onChange={e => setAgeLimit(e.target.value)}
      >
        {allowedAgeLimits.map((limit) => (
          <MenuItem key={limit} value={limit}>{limit} anni</MenuItem>
        ))}
      </Select>
    </FormControl>
  {/* Mostra l'anteprima della data limite calcolata */}
  {requiredYear && requiredMonth && requiredDay && (
    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
      Data limite: <b>{requiredDay}/{requiredMonth}/{requiredYear}</b>
    </Typography>
  )}
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, width: '100%' }} disabled={loading}>{loading ? 'Inviando...' : 'Invia richiesta'}</Button>
          <Button variant="text" sx={{ mt: 1, width: '100%' }} onClick={() => navigate('/doctor')}>Indietro</Button>
          {txHash && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>Richiesta inviata. Tx: {txHash}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        </Box>
      </Box>
    </Box>
  );
};

export default RequestVerification;
