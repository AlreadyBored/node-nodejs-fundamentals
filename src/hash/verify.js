import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const verify = async () => {
  const baseDir = path.join(__dirname, '../../');
  const checksumsPath = path.join(baseDir, 'checksums.json');

  try {
    await fsp.access(checksumsPath);
  } catch {
    throw new Error('FS operation failed');
  }

  let checksums;
  try {
    const data = await fsp.readFile(checksumsPath, 'utf8');
    checksums = JSON.parse(data);
  } catch {
    throw new Error('FS operation failed');
  }

  const fileNames = Object.keys(checksums);
  for (const fileName of fileNames) {
    const filePath = path.join(baseDir, fileName);
    let hash;
    try {
      await fsp.access(filePath);
      hash = await new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath);
        const sha256 = crypto.createHash('sha256');
        stream.on('error', reject);
        sha256.on('error', reject);
        stream.on('data', chunk => sha256.update(chunk));
        stream.on('end', () => resolve(sha256.digest('hex')));
      });
    } catch {
      hash = null;
    }
    if (hash && hash === checksums[fileName]) {
      console.log(`${fileName} — OK`);
    } else {
      console.log(`${fileName} — FAIL`);
    }
  }
};

await verify();