import { createReadStream } from 'fs';
import { createBrotliDecompress } from 'zlib';
import { pipeline } from 'stream/promises';
import { Writable } from 'stream';
import { mkdir, writeFile } from 'fs/promises';
import { access } from 'fs/promises';
import { join } from 'path';

const decompressDir = async () => {
  const compressedDir = join(process.cwd(), 'workspace', 'compressed');
  const archivePath = join(compressedDir, 'archive.br');
  const decompressedDir = join(process.cwd(), 'workspace', 'decompressed');

  try {
    await access(compressedDir);
    await access(archivePath);
  } catch {
    throw new Error('FS operation failed');
  }

  const chunks = [];
  const rs = createReadStream(archivePath);
  const decompress = createBrotliDecompress();

  const collect = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });

  await pipeline(rs, decompress, collect);

  const data = Buffer.concat(chunks).toString('utf-8');
  const entries = JSON.parse(data);

  await mkdir(decompressedDir, { recursive: true });

  for (const entry of entries) {
    const fullPath = join(decompressedDir, entry.path);

    if (entry.type === 'directory') {
      await mkdir(fullPath, { recursive: true });
    } else {
      const dir = join(fullPath, '..');
      await mkdir(dir, { recursive: true });
      const content = Buffer.from(entry.content, 'base64');
      await writeFile(fullPath, content);
    }
  }
};

await decompressDir();
