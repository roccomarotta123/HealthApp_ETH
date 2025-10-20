/**
 * deploy_and_call_external.js
 * - Deploy Groth16Verifier and HealthRecordNFT (implementation) to an external node
 * - Call initialize(admin, verifierAddress) on HealthRecordNFT
 * - Read Circom/build/proof.json and public.json
 * - Call verifier.verifyProof (callStatic) and HealthRecordNFT.accessWithProof (tx)
 * - Print results and events
 *
 * Requires .env with PROVIDER_URL and PRIVATE_KEY
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const RPC = process.env.PROVIDER_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!RPC || !PRIVATE_KEY) {
  console.error('Please set PROVIDER_URL and PRIVATE_KEY in .env');
  process.exit(1);
}

const { ethers } = require('ethers');

async function readJson(p) {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', p)));
}

const toHex = (v) => {
  if (typeof v === 'string' && v.startsWith('0x')) return v;
  if (typeof v === 'number') return '0x' + v.toString(16);
  return '0x' + BigInt(v).toString(16);
};

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log('Using wallet', await wallet.getAddress());

  // Load artifacts
  const verifierArtifact = require('../artifacts/contracts/Verifier.sol/Groth16Verifier.json');
  const healthArtifact = require('../artifacts/contracts/HealthRecordNFT.sol/HealthRecordNFT.json');

  // Deploy verifier
  console.log('Deploying Groth16Verifier...');
  const VerifierFactory = new ethers.ContractFactory(verifierArtifact.abi, verifierArtifact.bytecode, wallet);
  // manage nonce explicitly to avoid NONCE_EXPIRED on local nodes
  let nonce = await provider.getTransactionCount(await wallet.getAddress());
  const verifier = await VerifierFactory.deploy({ nonce, gasLimit: 8000000 });
  await verifier.waitForDeployment ? await verifier.waitForDeployment() : await verifier.deployed();
  nonce++;
  const verifierAddress = verifier.target ? verifier.target : verifier.address;
  console.log('Groth16Verifier deployed at', verifierAddress);

  // Deploy HealthRecordNFT implementation
  console.log('Deploying HealthRecordNFT implementation...');
  const HealthFactory = new ethers.ContractFactory(healthArtifact.abi, healthArtifact.bytecode, wallet);
  const health = await HealthFactory.deploy({ nonce, gasLimit: 8000000 });
  await health.waitForDeployment ? await health.waitForDeployment() : await health.deployed();
  nonce++;
  const healthAddress = health.target ? health.target : health.address;
  console.log('HealthRecordNFT deployed at', healthAddress);

  // Call initialize(admin, verifierAddress)
  console.log('Calling initialize(admin, verifierAddress) on HealthRecordNFT...');
  const admin = await wallet.getAddress();
  const txInit = await health.initialize(admin, verifierAddress, { gasLimit: 500000, nonce });
  console.log('initialize tx sent:', txInit.hash);
  await txInit.wait();
  nonce++;
  console.log('initialize tx mined');

  // Read proof/public
  const proof = await readJson('Circom/build/proof.json');
  const publicSignals = await readJson('Circom/build/public.json');

  const a = [toHex(proof.pi_a[0]), toHex(proof.pi_a[1])];
  const b = [
    [toHex(proof.pi_b[0][1]), toHex(proof.pi_b[0][0])],
    [toHex(proof.pi_b[1][1]), toHex(proof.pi_b[1][0])]
  ];
  const c = [toHex(proof.pi_c[0]), toHex(proof.pi_c[1])];
  const publicInputs = publicSignals.map((v) => toHex(v));

  // Call verifier.verifyProof (callStatic)
  try {
    const ok = await verifier.callStatic.verifyProof(a, b, c, publicInputs);
    console.log('verifier.callStatic.verifyProof =>', ok);
  } catch (e) {
    console.warn('verifier.callStatic failed:', e.message || e);
  }

  // Call health.accessWithProof
  try {
  const tx = await health.accessWithProof(a, b, c, publicInputs, { gasLimit: 1200000, nonce });
    console.log('accessWithProof tx sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('accessWithProof tx confirmed in block', receipt.blockNumber);
    console.log('Raw logs:', receipt.logs);
  } catch (e) {
    console.error('accessWithProof failed:', e.message || e);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
