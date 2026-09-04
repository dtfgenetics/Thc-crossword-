import fs from 'node:fs/promises';

const CLUE_FILES = [
  'content/clue-bank.json',
  'content/clue-bank-science.json'
];

export async function loadClueBank() {
  const chunks = await Promise.all(CLUE_FILES.map(async (file) => {
    const text = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error(`${file} must contain a JSON array.`);
    return parsed;
  }));
  return chunks.flat();
}

export { CLUE_FILES };
