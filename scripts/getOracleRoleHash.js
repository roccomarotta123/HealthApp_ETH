const { keccak256, toUtf8Bytes } = require("ethers");

const role = keccak256(toUtf8Bytes("ORACLE_ROLE"));
console.log("ORACLE_ROLE hash:", role);