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


## Demo video

Guarda la demo della DApp: [Demo](https://drive.google.com/file/d/1fbEMucQG8LwpOzBQNLXdT8GobshvJllZ/view?usp=sharing)

### Cosa mostra la demo

Nella prima parte del video si vede il medico accedere con MetaMask alla sua pagina. Lo smart contract, al momento dell’accesso, verifica che l’indirizzo abbia il ruolo di ORACOLO e consente l’accesso alla pagina del medico. In questa pagina il medico carica un file JSON che rappresenta la cartella clinica e specifica l’indirizzo associato allo specifico paziente. Cliccando su "MINT NFT" viene generato un nuovo NFT con tre campi: token id, patient id e CID (identificativo su IPFS Pinata).

Prima di visualizzare la cartella clinica dal lato paziente, il medico invia una richiesta di verifica con anno specificato pari a 2000. Il paziente, nato nel 1980, quando esegue la verifica e fornisce prove valide per il circuito, ottiene un risultato positivo. Il medico può visualizzare lo stato delle richieste e vede che quella appena inoltrata è in corso.

Successivamente accede alla DApp il paziente, che vede la propria cartella clinica e accede alla sezione per effettuare la verifica tramite ZKP. Cliccando su "verifica" vengono generate la proof e i publicInputs, che vengono passati alla funzione smart contract verifyProof. Questa funzione verifica la proof rispetto al circuito e, una volta validata, controlla il valore in publicInputs per determinare l’esito del confronto. Il paziente non vede questi dettagli tecnici.

Quando il medico torna a verificare lo stato delle richieste, osserva che la richiesta risulta ora verificata e compare una spunta che indica che la condizione requiredYear < BHpatient è soddisfatta. Tutto questo avviene senza rivelare né la cartella clinica né la data di nascita del paziente.

Nella seconda parte della demo vengono mostrate le funzionalità di concessione e revoca dell’accesso alle cartelle cliniche. Il paziente concede l’accesso a un altro medico, che accedendo alla DApp vede confermato l’accesso alla cartella clinica.

## Funzionalità per Paziente e Medico

### Paziente
- Visualizzare la propria cartella clinica digitale (NFT)
- Revocare o fornire l’accesso ai propri dati in qualsiasi momento.
- Generare e fornire prove Zero Knowledge (zk-SNARK) per dimostrare informazioni (es. maggiore età) senza rivelare dati sensibili


### Medico
 - Caricare nuove cartelle cliniche o aggiornare dati sanitari, associandoli a uno specifico paziente
 - Visualizzare i dati sanitari solo dei pazienti che hanno fornito esplicito consenso all’accesso
 - Inviare richieste di verifica dell’età del paziente tramite Zero Knowledge Proof (ZKP): il medico può specificare un anno di nascita massimo e ricevere solo la conferma se il paziente è più vecchio o ha esattamente quell’età (cioè se l’anno di nascita del paziente è minore o uguale a quello fornito dal medico), senza accedere direttamente alla data di nascita o ad altri dati sensibili
 - Consultare lo storico di tutte le richieste di verifiche effettuate, monitorando lo stato di ciascuna richiesta (in attesa, approvata, rifiutata)

#### Progetti simili
Un esempio di progetto con obiettivi simili è [Patientory](https://patientory.com/), una piattaforma che utilizza la blockchain per la gestione e la condivisione sicura dei dati sanitari tra pazienti e operatori. Tuttavia, Patientory non integra le Zero Knowledge Proofs e non utilizza NFT per la rappresentazione delle cartelle cliniche.

## Avvio Applicazione Web
## Prerequisiti
- Node.js >= 18 (v22.20.0)
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

