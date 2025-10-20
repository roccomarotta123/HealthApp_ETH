pragma circom 2.0.0;
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

// Questo circuito dimostra che l'anno di nascita è inferiore o uguale all'anno richiesto (AnnoCorrente - EtàMinima)
template AgeProof() {
    // INPUT SEGRETI (Witness)
    signal input yearOfBirth; // Es. 1990
    signal input salt;        // Il valore segreto usato per l'Impegno

    // INPUT PUBBLICI
    signal input requiredYear;   // Anno massimo consentito (es. 2024 - 18 = 2006)
    signal input commitment;     // L'Impegno (Commitment) Hash registrato sullo Smart Contract

    // 1. Calcola l'Impegno: Assicurati che l'input segreto corrisponda all'hash pubblico
    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== yearOfBirth;
    commitmentHasher.inputs[1] <== salt;
    
    // Vincolo di Ancoraggio
    commitmentHasher.out === commitment;

    // 2. Logica Range Proof: yearOfBirth <= requiredYear
    // LessThan(N) richiede una dimensione fissa in bit (32 per i numeri interi standard)
    component check_le = LessThan(32);
    check_le.in[0] <== yearOfBirth;
    check_le.in[1] <== requiredYear + 1; // Aggiungi 1 per includere il limite superiore
    
    signal output out <== check_le.out;
}

component main = AgeProof();