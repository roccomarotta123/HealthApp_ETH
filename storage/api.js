const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { ethers } = require('ethers');
const { PinataSDK } = require('pinata');
require('dotenv').config({ path: '../.env' });
console.log("PINATA_JWT usata:", process.env.PINATA_JWT?.slice(0, 20) + "...");

const HealthRecordNFT = require('../frontend/src/abi/HealthRecordNFT.json');

const app = express();
app.use(cors());
const upload = multer();

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY,
});

const PROVIDER_URL = process.env.PROVIDER_URL;


// Route upload file su Pinata
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file ricevuto' });
    }
    const file = new File([req.file.buffer], req.file.originalname, { type: req.file.mimetype });
    const result = await pinata.upload.public.file(file);
    res.json({ cid: result.cid });
  } catch (err) {
    console.error("Errore upload Pinata:", err);
    res.status(500).json({ error: 'Errore upload Pinata' });
  }
});




// Route per recuperare dati clinici da una lista di CID
app.post('/api/records/fetch', express.json(), async (req, res) => {
  try {
    const { cids } = req.body;
    if (!Array.isArray(cids)) {
      return res.status(400).json({ error: 'CID non validi' });
    }
    // Filtra i CID duplicati
    const uniqueCids = [...new Set(cids)];
    const records = await Promise.all(
      uniqueCids.map(async (cid) => {
        try {
          const { data, contentType } = await pinata.gateways.public.get(cid);
          if (contentType && contentType.includes('application/json')) {
            return typeof data === 'string' ? JSON.parse(data) : data;
          } else {
            return { raw: data, contentType, cid };
          }
        } catch {
          return { errore: 'Impossibile recuperare dati da IPFS', cid };
        }
      })
    );
    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Errore recupero dati da IPFS' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server API avviato su http://localhost:${PORT}`);
});