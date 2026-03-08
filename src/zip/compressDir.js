import { readdir, stat, readFile } from 'fs/promises';
import { createWriteStream } from 'fs';
import { createBrotliCompress } from 'zlib';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { join } from 'path';

const compressDir = async () => {
  const toCompressDir = join(process.cwd(), 'workspace', 'toCompress');
  const compressedDir = join(process.cwd(), 'workspace', 'compressed');
  const archivePath = join(compressedDir, 'archive.br');

  let entries;
  try {
    await stat(toCompressDir);
  } catch {
    throw new Error('FS operation failed');
  }

  const collect = async (dirPath, relBase = '') => {
    const items = await readdir(dirPath, { withFileTypes: true });
    const result = [];

    for (const item of items) {
      const fullPath = join(dirPath, item.name);
      const relPath = relBase ? `${relBase}/${item.name}` : item.name;

      if (item.isDirectory()) {
        result.push({ path: relPath, type: 'directory' });
        result.push(...(await collect(fullPath, relPath)));
      } else {
        const content = await readFile(fullPath);
        result.push({
          path: relPath,
          type: 'file',
          content: content.toString('base64'),
        });
      }
    }
    return result;
  };

  entries = await collect(toCompressDir);

  const archiveData = JSON.stringify(entries);
  const { mkdir } = await import('fs/promises');
  await mkdir(compressedDir, { recursive: true });

  const ws = createWriteStream(archivePath);
  const compress = createBrotliCompress();
  const rs = Readable.from([Buffer.from(archiveData, 'utf-8')]);

  await pipeline(rs, compress, ws);
};

await compressDir();
