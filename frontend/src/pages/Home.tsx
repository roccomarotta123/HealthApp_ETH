import React from "react";
import { Button, Typography, Box, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getContract } from "../contractService";
import { useWallet } from "../context/WalletContext";

const ORACLE_ROLE = "0x68e79a7bf1e0bc45d0a330c573bc367f9cf464fd326078812f301165fbda4ef1";

const Home: React.FC = () => {
  const { account, setAccount } = useWallet();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  // Funzione per connettere MetaMask e reindirizzare
  const connectAndRedirect = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!window.ethereum) throw new Error("MetaMask non installato");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const user = accounts[0];
      setAccount(user);
      // Verifica ruolo tramite smart contract
      const contract = await getContract();
      const isDoctor = await contract.hasRole(ORACLE_ROLE, user);
      if (isDoctor) {
        navigate("/doctor");
      } else {
        navigate("/patient");
      }
    } catch (err: any) {
      setError(err.message || "Errore durante la connessione");
    } finally {
      setLoading(false);
    }
  };

  // Funzione per logout
  const logout = () => {
    setAccount(null);
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
      <Typography variant="h3" gutterBottom>
        Benvenuto in HealthRecord dApp
      </Typography>
      <Typography variant="body1" gutterBottom>
        Per continuare, connetti il tuo wallet MetaMask.
      </Typography>
      {account ? (
        <Button variant="outlined" color="secondary" onClick={logout} sx={{ mt: 4 }}>
          Logout
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={connectAndRedirect}
          disabled={loading}
          sx={{ mt: 4 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Connetti MetaMask"}
        </Button>
      )}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
};

export default Home;
