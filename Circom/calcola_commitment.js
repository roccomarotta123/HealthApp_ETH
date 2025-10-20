const circomlibjs = require("circomlibjs");
const fs = require("fs");

async function main() {
  const inputPath = "./input.json";
  const inputRaw = fs.readFileSync(inputPath, "utf8");
  const input = JSON.parse(inputRaw);
  const yearOfBirth = parseInt(input.yearOfBirth);
  const salt = parseInt(input.salt);

  // Calcola commitment Poseidon
  const poseidon = await circomlibjs.buildPoseidon();
  const commitment = poseidon.F.toString(poseidon([yearOfBirth, salt]));

  input.commitment = commitment;
  fs.writeFileSync(inputPath, JSON.stringify(input));
  console.log("Nuovo input.json:", input);
}

main();
