import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const verify = async () => {
  const dirPath1 = path.join(import.meta.dirname, 'files');
  const dirPath2 = import.meta.dirname;

  let targetDir = dirPath1;
  let checksumsData;

  try {
    checksumsData = await fs.readFile(path.join(dirPath1, 'checksums.json'), 'utf8');
  } catch {
    try {
      checksumsData = await fs.readFile(path.join(dirPath2, 'checksums.json'), 'utf8');
      targetDir = dirPath2;
    } catch {
      throw new Error('FS operation failed');
    }
  }

  const checksums = JSON.parse(checksumsData);

  for (const [filename, expectedHash] of Object.entries(checksums)) {
    const filePath = path.join(targetDir, filename);
    let isOk = false;

    try {
      const hash = crypto.createHash('sha256');
      const stream = createReadStream(filePath);

      await new Promise((resolve, reject) => {
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
      });

      const actualHash = hash.digest('hex');
      if (actualHash === expectedHash) {
        isOk = true;
      }
    } catch {
      // Stream or file reading failed, isOk remains false
    }

    if (isOk) {
      console.log(`${filename} — OK`);
    } else {
      console.log(`${filename} — FAIL`);
    }
  }
};

await verify();
