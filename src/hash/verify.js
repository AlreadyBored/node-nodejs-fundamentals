import { promises as fs, createReadStream } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';

const verify = async () => {
  const checksumsFile = resolve(process.cwd(), 'checksums.json');

  try {
    await fs.access(checksumsFile);
  } catch (error) {
    throw new Error('FS operation failed');
  }

  const checksums = JSON.parse(await fs.readFile(checksumsFile, 'utf8'));

  for (const [filename, expectedHash] of Object.entries(checksums)) {
    const filePath = resolve(process.cwd(), filename);
    try {
      const hash = createHash('sha256');
      const stream = createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      
      await new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      const actualHash = hash.digest('hex');
      console.log(`${filename} — ${actualHash === expectedHash ? 'OK' : 'FAIL'}`);
    } catch (error) {
      console.log(`${filename} — FAIL`);
    }
  }
};

await verify();
