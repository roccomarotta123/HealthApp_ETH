
# HealthApp_ETH - Avvio Applicazione Web

## Prerequisiti
- Node.js >= 18
- npm (o yarn)

## 1. Clona il repository
```bash
git clone https://github.com/roccomarotta123/HealthApp_ETH.git
cd HealthApp_ETH
```

## 2. Installa le dipendenze
```bash
npm install
cd frontend
npm install
```

## 3. Avvia la blockchain locale (Hardhat)
```bash
npx hardhat node
```

## 4. Deploy degli smart contract
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

## 5. Avvia il backend (Express)
```bash
node storage/api.js
```


## Configurazione variabili d'ambiente

Per il corretto funzionamento dell'applicazione, è necessario creare un file `.env` nella **root del progetto** con le seguenti variabili:

```
PINATA_JWT=your_pinata_jwt_key
PINATA_GATEWAY=your_pinata_gateway
PROVIDER_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=your_contract_address
```

**Nota:** Il file `.env` non viene incluso nel repository per motivi di sicurezza. Dopo aver clonato il progetto, crea manualmente il file `.env` nella root e inserisci le tue chiavi/parametri.

## 7. Accedi all'applicazione
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:4000](http://localhost:4000)

---

