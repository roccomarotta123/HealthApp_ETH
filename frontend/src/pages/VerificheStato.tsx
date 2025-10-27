import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getContract } from '../contractService';
import { useWallet } from '../context/WalletContext';

const useVerifiche = () => {
  const { account } = useWallet();
  const [verifiche, setVerifiche] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!account) return;
    let cancelled = false;
    (async () => {
      try {
        const contract = await getContract();
        // Recupera tutti gli eventi AgeVerificationRequested dove doctor == account
        const filterRequested = contract.filters.AgeVerificationRequested(null, account, null);
        const eventsRequested = await contract.queryFilter(filterRequested);

        // Recupera tutti gli eventi AgeVerificationResult dove doctor == account
        const filterResult = contract.filters.AgeVerificationResult(account, null, null, null);
        const eventsResult = await contract.queryFilter(filterResult);

        // Crea una lista di risultati con medico, paziente, data richiesta e risultato
        const resultList = eventsResult.map(ev => {
          if ('args' in ev && ev.args) {
            const { doctor, user, requiredYear, requiredMonth, requiredDay, result } = ev.args;
            return {
              doctor: doctor.toLowerCase(),
              user: user.toLowerCase(),
              anno: requiredYear?.toString() ?? '',
              mese: requiredMonth?.toString() ?? '',
              giorno: requiredDay?.toString() ?? '',
              risultato: result.toString()
            };
          }
          return null;
        }).filter(Boolean);

        // Popola la tabella associando richiesta e risultato per medico, paziente e data
        const records = eventsRequested.map((ev, idx) => {
          if (!('args' in ev) || !ev.args) return null;
          const { patient, doctor, requiredYear, requiredMonth, requiredDay } = ev.args;
          const paziente = patient;
          const medico = doctor;
          const anno = requiredYear?.toString() ?? '';
          const mese = requiredMonth?.toString() ?? '';
          const giorno = requiredDay?.toString() ?? '';
          // Cerca risultato corrispondente per medico, paziente e data
          let match = null;
          for (const r of resultList) {
            if (!r) continue;
            const isMatch = r.doctor === medico.toLowerCase() && r.user === paziente.toLowerCase() && r.anno === anno && r.mese === mese && r.giorno === giorno;
            // Log di debug dettagliato
            console.log('[DEBUG MATCH]', {
              richiesta: { medico: medico.toLowerCase(), paziente: paziente.toLowerCase(), anno, mese, giorno },
              risultato: { doctor: r.doctor, user: r.user, anno: r.anno, mese: r.mese, giorno: r.giorno },
              isMatch
            });
            if (isMatch) {
              match = r;
              break;
            }
          }
          const risultato = match ? match.risultato : '-';
          const stato = match ? 'verifica completata' : 'in corso';
          return {
            id: idx + 1,
            paziente,
            anno,
            mese,
            giorno,
            stato,
            risultato
          };
        }).filter(Boolean);
        if (!cancelled) setVerifiche(records);
      } catch (err) {
        if (!cancelled) setVerifiche([]);
      }
    })();
    return () => { cancelled = true; };
  }, [account]);
  return verifiche;
};

const VerificheStato: React.FC = () => {
  const navigate = useNavigate();
  const verifiche = useVerifiche();

  // Funzione per mostrare emoji in base al risultato
  const risultatoEmoji = (val: string) => {
    if (val === "1") return "✅";
    if (val === "0") return "❌";
    return val === "-" ? "-" : val;
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" width="100vw">
      <Box sx={{ width: 600, mb: 4 }}>
        <Typography variant="h4" gutterBottom>Stato delle verifiche</Typography>
        <Button variant="text" onClick={() => navigate('/request-verification')}>Torna a Richiedi verifica</Button>
      </Box>
      <TableContainer component={Paper} sx={{ width: 600 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Paziente</TableCell>
              <TableCell>Data richiesta</TableCell>
              <TableCell>Età richiesta</TableCell>
              <TableCell>Stato</TableCell>
              <TableCell>Risultato</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {verifiche.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{v.id}</TableCell>
                <TableCell>{typeof v.paziente === 'string' ? `${v.paziente.slice(0, 6)}...${v.paziente.slice(-4)}` : ''}</TableCell>
                <TableCell>{v.giorno && v.mese && v.anno ? `${v.giorno}/${v.mese}/${v.anno}` : v.anno}</TableCell>
                <TableCell>{v.anno ? (new Date().getUTCFullYear() - Number(v.anno)) : '-'}</TableCell>
                <TableCell>{v.stato}</TableCell>
                <TableCell>{risultatoEmoji(v.risultato)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VerificheStato;
