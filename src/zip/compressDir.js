import fs from 'fs';
import path from 'path';
import { createBrotliCompress } from 'zlib';
import { pipeline } from 'stream/promises';
import * as tar from 'tar';

const sourceDir = path.resolve('workspace/toCompress');
const destDir = path.resolve('workspace/compressed');
const archivePath = path.join(destDir, 'archive.br');

const compressDir = async () => {
  try {
    await fs.promises.access(sourceDir);

    await fs.promises.mkdir(destDir, { recursive: true });

    const tarStream = tar.c(
      {
        cwd: sourceDir,
      },
      ['.']
    );

    const brotli = createBrotliCompress();
    const writeStream = fs.createWriteStream(archivePath);

    await pipeline(tarStream, brotli, writeStream);
  } catch (err) {
    throw new Error('FS operation failed');
  }
}

await compressDir();
