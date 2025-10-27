const circomlibjs = require("circomlibjs");
const fs = require("fs");

async function main() {
  const inputPath = "./input.json";
  const inputRaw = fs.readFileSync(inputPath, "utf8");
  const input = JSON.parse(inputRaw);
  const birthYear = parseInt(input.birthYear);
  const birthMonth = parseInt(input.birthMonth);
  const birthDay = parseInt(input.birthDay);
  const salt = parseInt(input.salt);

  // Calcola commitment Poseidon su tutti i dati segreti
  const poseidon = await circomlibjs.buildPoseidon();
  const commitment = poseidon.F.toString(
    poseidon([birthYear, birthMonth, birthDay, salt])
  );

  input.commitment = commitment;
  fs.writeFileSync(inputPath, JSON.stringify(input));
  console.log("Nuovo input.json:", input);
}

main();
