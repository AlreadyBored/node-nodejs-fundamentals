import { createReadStream } from 'fs';
import { createHash } from 'crypto';
import { readFile } from 'fs/promises';
import { join } from 'path';

const verify = async () => {
  const checksumsPath = join(process.cwd(), 'checksums.json');

  let checksums;
  try {
    const content = await readFile(checksumsPath, 'utf-8');
    checksums = JSON.parse(content);
  } catch {
    throw new Error('FS operation failed');
  }

  for (const [filename, expectedHash] of Object.entries(checksums)) {
    const filePath = join(process.cwd(), filename);

    let ok = false;
    try {
      const hash = createHash('sha256');
      const stream = createReadStream(filePath);

      await new Promise((resolve, reject) => {
        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      const actualHash = hash.digest('hex');
      ok = actualHash === expectedHash;
    } catch {
      ok = false;
    }
    console.log(`${filename} — ${ok ? 'OK' : 'FAIL'}`);
  }
};

await verify();
