// age_limit_server.js
// Server Express che espone un endpoint per calcolare la data limite età
// Esegue la stessa logica dello script Chainlink Functions

const express = require('express');
const app = express();
app.use(express.json());

function getLimitDate(ageLimit) {
    const now = new Date();
    const year = now.getUTCFullYear() - ageLimit;
    const month = now.getUTCMonth() + 1;
    const day = now.getUTCDate();
    return { year, month, day };
}

app.post('/api/age-limit', (req, res) => {
    const { patient, doctor, ageLimit } = req.body;
    if (![14, 16, 18, 21].includes(Number(ageLimit))) {
        return res.status(400).json({ error: 'Limite età non consentito' });
    }
    const { year, month, day } = getLimitDate(Number(ageLimit));
    res.json({ patient, doctor, ageLimit: Number(ageLimit), year, month, day });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Age limit server listening on port ${PORT}`);
});
