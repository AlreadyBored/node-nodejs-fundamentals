import fs from 'fs/promises';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { createBrotliCompress } from 'zlib';

const compressDir = async () => {
  // Write your code here
  // Read all files from workspace/toCompress/
  // Compress entire directory structure into archive.br
  // Save to workspace/compressed/
  // Use Streams API

  const folderPath = '/home/dimazdr/projects/node-nodejs-fundamentals/toCompress';
  const rootFolder = '/home/dimazdr/projects/node-nodejs-fundamentals/compressed';
  const archivePath = path.join(rootFolder, 'archive.br');

  try {
    await fs.access(folderPath);
  } catch {
    throw new Error('FS operation failed');
  }

  await fs.mkdir(rootFolder, { recursive: true });

  const brotli = createBrotliCompress();
  const output = createWriteStream(archivePath);
  brotli.pipe(output);

  const scan = async (rPath) => {
    const items = await fs.readdir(rPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(rPath, item.name);
      const relPath = path.relative(folderPath, fullPath);

      if (item.isDirectory()) {
        await scan(fullPath);
      } else if (item.isFile()) {
        const stat = await fs.stat(fullPath);

        const pathBuffer = Buffer.from(relPath, 'utf-8');
        const pathLen = Buffer.alloc(4);
        pathLen.writeUInt32BE(pathBuffer.length, 0);

        const sizeBuffer = Buffer.alloc(8);
        sizeBuffer.writeBigUInt64BE(BigInt(stat.size), 0);

        brotli.write(pathLen);
        brotli.write(pathBuffer);
        brotli.write(sizeBuffer);

        await new Promise((resolve, reject) => {
          const fileStream = createReadStream(fullPath);
          fileStream.pipe(brotli, { end: false });
          fileStream.on('end', resolve);
          fileStream.on('error', reject);
        });
      }
    }
  };

  await scan(folderPath);
  brotli.end();
};

await compressDir();