import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const verify = async () => {
  // Write your code here
  // Read checksums.json
  // Calculate SHA256 hash using Streams API
  // Print result: filename — OK/FAIL
  try {
    const checksumsPath = path.join(process.cwd(), 'checksums.json');

    const raw = await fsp.readFile(checksumsPath, 'utf-8');
    const checksums = JSON.parse(raw);

    for (const [filename, expectedHash] of Object.entries(checksums)) {
      const filePath = path.join(process.cwd(), filename);

      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      await new Promise((resolve, reject) => {
        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      const calculatedHash = hash.digest('hex');

      if (calculatedHash === expectedHash) {
        console.log(`${filename} — OK`);
      } else {
        console.log(`${filename} — FAIL`);
      }
    }
  } catch {
    throw new Error('FS operation failed');
  }
};

await verify();
