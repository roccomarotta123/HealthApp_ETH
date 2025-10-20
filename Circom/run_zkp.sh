#!/bin/bash
set -e

# 1. Calcola commitment Poseidon e aggiorna input.json
# (usa lo script JS già esistente per aggiornare input.json)
echo "[1] Calcolo commitment con Node.js..."
node calcola_commitment.js

# 2. Genera witness
echo "[2] Genero witness..."
node build/age_proof_js/generate_witness.js build/age_proof_js/age_proof.wasm input.json build/witness.wtns

# 3. Genera proof
echo "[3] Genero proof..."
snarkjs groth16 prove build/circuit_final.zkey build/witness.wtns build/proof.json build/public.json

# 4. Verifica proof
echo "[4] Verifico proof..."
snarkjs groth16 verify build/verification_key.json build/public.json build/proof.json

echo "[5] Genero calldata Solidity (per verifica on-chain)..."
(cd build && snarkjs generatecall > calldata.txt)
echo "\nTutto eseguito correttamente!"
