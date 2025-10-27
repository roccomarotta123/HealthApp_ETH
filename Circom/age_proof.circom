pragma circom 2.0.0;
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

// Questo circuito dimostra che la data di nascita (giorno, mese, anno) è <= della data limite richiesta
template AgeProofFullDate() {
    // INPUT SEGRETI (Witness)
    signal input birthYear;  // Es. 1990
    signal input birthMonth; // Es. 7
    signal input birthDay;   // Es. 15
    signal input salt;       // Il valore segreto usato per l'Impegno

    // INPUT PUBBLICI
    signal input limitYear;   // Anno limite (es. 2006)
    signal input limitMonth;  // Mese limite (es. 10)
    signal input limitDay;    // Giorno limite (es. 24)
    signal input commitment;  // L'Impegno (Commitment) Hash registrato sullo Smart Contract

    // 1. Calcola l'Impegno: Assicurati che l'input segreto corrisponda all'hash pubblico
    component commitmentHasher = Poseidon(4);
    commitmentHasher.inputs[0] <== birthYear;
    commitmentHasher.inputs[1] <== birthMonth;
    commitmentHasher.inputs[2] <== birthDay;
    commitmentHasher.inputs[3] <== salt;
    commitmentHasher.out === commitment;

    // 2. Logica Range Proof: (birthYear, birthMonth, birthDay) <= (limitYear, limitMonth, limitDay)
    // a) Se birthYear < limitYear => OK
    // b) Se birthYear == limitYear, allora birthMonth < limitMonth => OK
    // c) Se birthYear == limitYear && birthMonth == limitMonth, allora birthDay <= limitDay

    // a) birthYear < limitYear
    component year_lt = LessThan(32);
    year_lt.in[0] <== birthYear;
    year_lt.in[1] <== limitYear;

    // b) birthYear == limitYear
    component yearEq = IsEqual();
    yearEq.in[0] <== birthYear;
    yearEq.in[1] <== limitYear;
    signal year_eq;
    year_eq <== yearEq.out;

    // c) birthMonth < limitMonth
    component month_lt = LessThan(32);
    month_lt.in[0] <== birthMonth;
    month_lt.in[1] <== limitMonth;

    // d) birthMonth == limitMonth
    component monthEq = IsEqual();
    monthEq.in[0] <== birthMonth;
    monthEq.in[1] <== limitMonth;
    signal month_eq;
    month_eq <== monthEq.out;

    // e) birthDay <= limitDay
    component day_le = LessThan(32);
    day_le.in[0] <== birthDay;
    day_le.in[1] <== limitDay + 1;

    // Combinazione logica:
    // (year_lt) || (year_eq && month_lt) || (year_eq && month_eq && day_le)
    signal cond1;
    cond1 <== year_lt.out;
    signal cond2;
    cond2 <== year_eq * month_lt.out;
    signal tmp;
    tmp <== year_eq * month_eq;
    signal cond3;
    cond3 <== tmp * day_le.out;

    signal sum;
    sum <== cond1 + cond2 + cond3;
    component isZero = IsZero();
    isZero.in <== sum;
    signal output out;
    out <== 1 - isZero.out;
}

component main = AgeProofFullDate();