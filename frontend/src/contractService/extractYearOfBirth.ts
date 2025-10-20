// Funzione per estrarre l'anno di nascita da un file cartella clinica JSON
// path: percorso del file JSON
export async function extractYearOfBirthFromFile(path: string): Promise<number> {
  const response = await fetch(path);
  const data = await response.json();
  if (!data.dob) throw new Error('Campo dob mancante');
  // dob formato: YYYY-MM-DD
  const year = parseInt(data.dob.split('-')[0], 10);
  if (isNaN(year)) throw new Error('Data di nascita non valida');
  return year;
}
