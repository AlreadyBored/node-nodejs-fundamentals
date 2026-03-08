import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { createHash } from 'crypto';

const CHECKSUMS = path.join(process.cwd(), 'checksums.json');

const verify = async () => {
  let checksums;
  try {
    const data = await fs.readFile(CHECKSUMS, 'utf-8');
    checksums = JSON.parse(data);
  } catch {
    throw new Error('FS operation failed');
  }

  for (const [filename, expected] of Object.entries(checksums)) {
    try {
      const hash = createHash('sha256');
      await new Promise((resolve, reject) => {
        const stream = createReadStream(path.join(process.cwd(), filename));
        stream.on('error', reject);
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', resolve);
      });
      const actual = hash.digest('hex');
      console.log(`${filename} — ${actual === expected ? 'OK' : 'FAIL'}`);
    } catch {
      console.log(`${filename} — FAIL`);
    }
  }
};

await verify();