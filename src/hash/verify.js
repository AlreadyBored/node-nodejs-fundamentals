import fs from 'fs';
import crypto from 'crypto';
import { readFile } from 'fs/promises';

const hashFile = (filePath) =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });

const verify = async () => {
  const checksums = JSON.parse(await readFile('checksums.json', 'utf8'));

  for (const [filename, expected] of Object.entries(checksums)) {
    try {
      const actual = await hashFile(filename);
      const status = actual === expected ? 'OK' : 'FAIL';
      console.log(`${filename} — ${status}`);
    } catch {
      console.log(`${filename} — FAIL`);
    }
  }
};

await verify();
