import { fileURLToPath } from 'node:url';
import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const verify = async () => {
  const getHash = (filePath) => new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const readStream = createReadStream(filePath);

    readStream.on('error', reject);

    readStream.on('data', (chunk) => hash.update(chunk));

    readStream.on('end', () => resolve(hash.digest('hex')));
  });

  const currentFilePath = fileURLToPath(import.meta.url);
  const rootPath = join(currentFilePath, '..', '..', '..', 'checksums.json');

  let checksums;

  try {
    checksums = JSON.parse(await readFile(rootPath, 'utf8'));
  } catch {
    error.message = `FS operation failed\n${error.message}`;
    throw error;
  }

  for (const [fileName, expectedHash] of Object.entries(checksums)) {
    try {
      const actualHash = await getHash(join(currentFilePath, '..', '..', '..', fileName));
      const status = actualHash === expectedHash ? 'OK' : 'FAIL';

      console.log(`${fileName} — ${status}`);
    } catch {
      console.log(`${fileName} — FAIL`);
    }
  }
};

verify();