//File di prova per caricare un JSON di esempio su Pinata
import { PinataSDK } from "pinata";

import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pinata = new PinataSDK({
  pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5ZjRlOTZkYy1lMmNjLTQ5NmEtOGU3NS1iZjBmZDFmOGU5MjYiLCJlbWFpbCI6InJvY2NvbWFyb3R0YTEyM0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZjgyYzk1OTVjNjU2ZmI5ZWJhZTciLCJzY29wZWRLZXlTZWNyZXQiOiI0NTIwYmQ1M2UyMjdhY2I0MTM3ZTBmMzM1YTk2ZTdhMmRkNzIyOTFmNGQ5MTIxYjFkMTgxZDFjYTM0YTQxZDg2IiwiZXhwIjoxNzkxNDgyODM5fQ.V70jmK6je6yfSgr3Ac64uwIsA5C-rpi5Sv5aeb-ZoW0",
  pinataGateway: "apricot-important-snail-368.mypinata.cloud",
});

async function uploadJsonToPinata() {
  const jsonPath = path.resolve(__dirname, "../dataExample.json");
  const fileContent = fs.readFileSync(jsonPath, "utf-8");
  console.log("Contenuto letto da dataExample.json:", fileContent);
  const jsonData = JSON.parse(fileContent);
  const upload = await pinata.upload.public.json(jsonData);
  console.log("JSON caricato su Pinata:", upload);
}

uploadJsonToPinata().catch(console.error);


// per accedere da browser usare:
// https://apricot-important-snail-368.mypinata.cloud/ipfs/{cid file}