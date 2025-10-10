
# HealthApp_ETH 

### Tecnologie principali
- [OpenZeppelin](https://docs.openzeppelin.com/contracts/4.x/) — Librerie per la sicurezza e l’upgrade dei contratti
- [Hardhat](https://hardhat.org/) — Ambiente di sviluppo e test per smart contract
- [Pinata](https://www.pinata.cloud/) — Servizio usato per l’archiviazione decentralizzata dei file su IPFS
- [Zero Knowledge Proofs (zk-SNARK)](https://docs.circom.io/) — Protocolli crittografici per la privacy

### Problema affrontato
La gestione delle cartelle cliniche digitali in ambito sanitario presenta criticità legate a privacy, sicurezza e trasparenza degli accessi. Il nostro progetto mira a risolvere questi problemi sfruttando la blockchain per:

- Rendere trasparente e verificabile la gestione degli accessi ai dati sanitari
- Garantire la privacy dei pazienti tramite Zero Knowledge Proofs
- Offrire un sistema decentralizzato, sicuro e aggiornabile per la conservazione e la condivisione delle cartelle cliniche

Questa soluzione potrebbe essere interessante per pazienti, medici e strutture sanitarie che necessitano di un controllo rigoroso e trasparente sui dati sensibili.

#### Progetti simili
Un esempio di progetto con obiettivi simili è [Patientory](https://patientory.com/), una piattaforma che utilizza la blockchain per la gestione e la condivisione sicura dei dati sanitari tra pazienti e operatori. Tuttavia, Patientory non integra le Zero Knowledge Proofs e non utilizza NFT per la rappresentazione delle cartelle cliniche.

## Avvio Applicazione Web
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

## 6. Avvia il frontend (React + Vite)
```bash
cd frontend
npm run dev
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

