import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';
import { createBrotliDecompress } from 'zlib';
import readline from 'readline';

const WORKSPACE = path.join(process.cwd(), 'workspace');
const COMPRESSED_DIR = path.join(WORKSPACE, 'compressed');
const ARCHIVE = path.join(COMPRESSED_DIR, 'archive.br');
const OUT_DIR = path.join(WORKSPACE, 'decompressed');

const decompressDir = async () => {
  try {
    await fsPromises.access(COMPRESSED_DIR);
    await fsPromises.access(ARCHIVE);
  } catch {
    throw new Error('FS operation failed');
  }

  await fsPromises.mkdir(OUT_DIR, { recursive: true });

  const brotli = createBrotliDecompress();
  const archiveStream = fs.createReadStream(ARCHIVE);
  const decompressedStream = archiveStream.pipe(brotli);

  const rl = readline.createInterface({ input: decompressedStream, crlfDelay: Infinity });

  let state = 0;
  let relPath = '';
  let size = 0;
  let buffer = Buffer.alloc(0);

  rl.on('line', async (line) => {
    if (state === 0) {
      relPath = line;
      state = 1;
    } else if (state === 1) {
      size = parseInt(line, 10);
      buffer = Buffer.alloc(0);
      state = 2;
    }
  });

  decompressedStream.on('data', async (chunk) => {
    if (state === 2 && size > 0) {
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length >= size) {
        const filePath = path.join(OUT_DIR, relPath);
        await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
        await fsPromises.writeFile(filePath, buffer.slice(0, size));
        buffer = buffer.slice(size);
        state = 0;
      }
    }
  });

  await new Promise((resolve, reject) => {
    decompressedStream.on('end', resolve);
    decompressedStream.on('error', reject);
  });
};

await decompressDir();