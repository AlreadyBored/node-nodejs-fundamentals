import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const calculateHashStream = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    
    const stream = createReadStream(filePath);
    
    pipeline(
      stream,
      async function* (source) {
        for await (const chunk of source) {
          hash.update(chunk);
        }
      }
    )
    .then(() => {
      resolve(hash.digest('hex'));
    })
    .catch(reject);
  });
};

const verify = async () => {
  const srcDir = join(__dirname, '..');
  const checksumsPath = join(srcDir, 'checksums.json');
  const filesDir = join(srcDir, 'files');

  let checksums;
  try {
    const data = await readFile(checksumsPath, 'utf-8');
    checksums = JSON.parse(data);
  } catch (error) {
    throw new Error('FS operation failed');
  }

  const results = [];
  for (const [filename, expectedHash] of Object.entries(checksums)) {
    const filePath = join(filesDir, filename);
    
    try {
      const actualHash = await calculateHashStream(filePath);
      const status = actualHash === expectedHash ? 'OK' : 'FAIL';
      results.push(`${filename} — ${status}`);
    } catch (error) {
      results.push(`${filename} — FAIL`);
    }
  }

  results.forEach(result => console.log(result));
};

await verify();
