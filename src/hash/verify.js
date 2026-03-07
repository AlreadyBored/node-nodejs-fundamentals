import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const verify = async () => {
  const checksumsPath = path.join(__dirname, 'checksums.json');

  let data;
  try {
    data = await readFile(checksumsPath, 'utf-8');
  } catch {
    throw new Error('FS operation failed');
  }

  const checksums = JSON.parse(data);

  for (const [filename, expectedHash] of Object.entries(checksums)) {
    const filePath = path.join(__dirname, filename);
    const actualHash = await new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const stream = createReadStream(filePath);
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });

    const status = actualHash === expectedHash ? 'OK' : 'FAIL';
    console.log(`${filename} — ${status}`);
  }
};

await verify();
