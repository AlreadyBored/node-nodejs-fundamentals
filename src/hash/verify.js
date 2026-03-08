import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

const verify = async () => {
  const dir = '.'
  const checksumsPath = path.resolve(dir, 'checksums.json');

  let checksums;
  try {
    const raw = fs.readFileSync(checksumsPath, 'utf-8');
    checksums = JSON.parse(raw);
  } catch {
    throw new Error('FS operation failed');
  }

  for (const [filename, expected] of Object.entries(checksums)) {
    const filePath = path.resolve(dir, filename);

    try {
      const actual = await hashFile(filePath);
      const status = actual === expected ? 'OK' : 'FAIL';
      console.log(`${filename} — ${status}`);
    } catch {
      console.log(`${filename} — FAIL`);
    }
  }
};

await verify();
