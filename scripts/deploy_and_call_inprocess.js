/**
 * deploy_and_call_inprocess.js
 * - Compila
 * - Deploya Groth16Verifier
 * - Deploya HealthRecordNFT proxy (UUPS) passando verifierAddress
 * - Legge Circom/build/proof.json e public.json
 * - Costruisce a,b,c,publicInputs e chiama:
 *    1) verifyProof sul verifier (callStatic)
 *    2) accessWithProof sul proxy (transazione)
 * - Stampa risultati e event log
 */

const fs = require('fs');
const path = require('path');

async function readJson(p) {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', p)));
}

const toHex = (v) => {
  if (typeof v === 'string' && v.startsWith('0x')) return v;
  if (typeof v === 'number') return '0x' + v.toString(16);
  return '0x' + BigInt(v).toString(16);
};

async function main() {
  const hre = require('hardhat');
  await hre.run('compile');

  const signers = await hre.ethers.getSigners();
  const signer = signers[0];
  console.log('Using signer:', await signer.getAddress());

  // Deploy verifier
  console.log('Deploying Groth16Verifier...');
  const VerifierFactory = await hre.ethers.getContractFactory('Groth16Verifier');
  const verifier = await VerifierFactory.connect(signer).deploy();
  await verifier.waitForDeployment ? await verifier.waitForDeployment() : await verifier.deployed();
  const verifierAddress = verifier.target ? verifier.target : verifier.address;
  console.log('Groth16Verifier deployed at', verifierAddress);

  // Deploy proxy HealthRecordNFT with verifierAddress
  console.log('Deploying HealthRecordNFT proxy (UUPS) ...');
  const HealthRecordFactory = await hre.ethers.getContractFactory('HealthRecordNFT');
  const proxy = await hre.upgrades.deployProxy(HealthRecordFactory, [await signer.getAddress(), verifierAddress], { kind: 'uups', initializer: 'initialize' });
  await proxy.waitForDeployment ? await proxy.waitForDeployment() : await proxy.deployed();
  const proxyAddress = proxy.target ? proxy.target : proxy.address;
  console.log('HealthRecordNFT proxy deployed at', proxyAddress);

  // Read proof and public
  const proof = await readJson('Circom/build/proof.json');
  const publicSignals = await readJson('Circom/build/public.json');

  const a = [toHex(proof.pi_a[0]), toHex(proof.pi_a[1])];
  const b = [
    [toHex(proof.pi_b[0][1]), toHex(proof.pi_b[0][0])],
    [toHex(proof.pi_b[1][1]), toHex(proof.pi_b[1][0])]
  ];
  const c = [toHex(proof.pi_c[0]), toHex(proof.pi_c[1])];
  const publicInputs = publicSignals.map((v) => toHex(v));

  console.log('Prepared proof params:');
  console.log('a=', a);
  console.log('b=', b);
  console.log('c=', c);
  console.log('publicInputs=', publicInputs);

  // Call verifier.verifyProof (callStatic)
  try {
    const ok = await verifier.callStatic.verifyProof(a, b, c, publicInputs);
    console.log('verifier.callStatic.verifyProof =>', ok);
  } catch (e) {
    console.warn('verifier.callStatic failed:', e.message || e);
  }

  // Call proxy.accessWithProof (transaction)
  try {
    const tx = await proxy.connect(signer).accessWithProof(a, b, c, publicInputs, { gasLimit: 1200000 });
    console.log('accessWithProof tx sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('accessWithProof tx confirmed in block', receipt.blockNumber);

    // Print raw logs and decode all logs robustly
    console.log('Raw logs:', receipt.logs);
    for (const log of receipt.logs) {
      try {
        const parsed = proxy.interface.parseLog(log);
        // Normalize BigInt args to string for clean printing
        const args = Object.keys(parsed.args).reduce((acc, k) => {
          const v = parsed.args[k];
          acc[k] = typeof v === 'bigint' ? v.toString() : v;
          return acc;
        }, {});
        console.log('Decoded log:', parsed.name, args);
      } catch (e) {
        // not an event from this contract/interface - skip
      }
    }
  } catch (e) {
    console.error('accessWithProof failed:', e.message || e);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
