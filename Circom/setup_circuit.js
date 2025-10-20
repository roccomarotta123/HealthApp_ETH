const { execSync } = require("child_process");
const fs = require("fs");

const CIRCUIT = "age_proof";
const CIRCUIT_FILE = `${CIRCUIT}.circom`;
const BUILD_DIR = "build";
const PTAU_BASE = "pot12_0000.ptau";
const PTAU_CONTRIB = "pot12_0001.ptau";
const PTAU_FINAL = "pot12_final.ptau";
const ZKEY_FINAL = "circuit_final.zkey";

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function main() {
  // 1. Compila il circuito
  run(`circom ${CIRCUIT_FILE} --r1cs --wasm --sym -o ${BUILD_DIR}`);

  // 2. Genera il file ptau iniziale (se non esiste)
  if (!fs.existsSync(PTAU_BASE)) {
    run(`snarkjs powersoftau new bn128 12 ${PTAU_BASE} -v`);
  }

  // 3. Contribuisci alla ceremony (puoi ripetere per più contributori)
  run(`snarkjs powersoftau contribute ${PTAU_BASE} ${PTAU_CONTRIB} --name=\"First contribution\" -v`);
  run(`snarkjs powersoftau prepare phase2 ${PTAU_CONTRIB} ${PTAU_FINAL} -v`);

  // 4. Genera la proving key e la verification key
  run(`snarkjs groth16 setup ${BUILD_DIR}/${CIRCUIT}.r1cs ${PTAU_FINAL} ${BUILD_DIR}/${ZKEY_FINAL}`);
  run(`snarkjs zkey export verificationkey ${BUILD_DIR}/${ZKEY_FINAL} ${BUILD_DIR}/verification_key.json`);

  // 5. Genera il Verifier Solidity
  run(`snarkjs zkey export solidityverifier ${BUILD_DIR}/${ZKEY_FINAL} ../contracts/Verifier.sol`);

  console.log("\nSetup completato! Verifier.sol generato in ../contracts/");
}

main();
