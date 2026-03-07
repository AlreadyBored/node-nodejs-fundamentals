import { createReadStream, createWriteStream } from 'fs';
import { readdir, stat, mkdir, access } from 'fs/promises';
import { createBrotliCompress } from 'zlib';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function collectFiles(dir, basePath = '') {
  const entries = [];
  const items = await readdir(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = basePath ? path.join(basePath, item) : item;
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      entries.push({ path: relativePath, type: 'directory' });
      const nested = await collectFiles(fullPath, relativePath);
      entries.push(...nested);
    } else {
      entries.push({ path: relativePath, type: 'file', size: stats.size });
    }
  }

  return entries;
}

const compressDir = async () => {
  const toCompressPath = path.join(__dirname, 'workspace', 'toCompress');
  const compressedPath = path.join(__dirname, 'workspace', 'compressed');

  try {
    await access(toCompressPath);
  } catch {
    throw new Error('FS operation failed');
  }

  await mkdir(compressedPath, { recursive: true });

  const entries = await collectFiles(toCompressPath);
  const manifest = JSON.stringify(entries);
  const manifestBuf = Buffer.from(manifest, 'utf-8');
  const headerBuf = Buffer.alloc(4);
  headerBuf.writeUInt32BE(manifestBuf.length, 0);

  // Read all file contents
  const fileBuffers = [];
  for (const entry of entries) {
    if (entry.type === 'file') {
      const content = await new Promise((resolve, reject) => {
        const chunks = [];
        const rs = createReadStream(path.join(toCompressPath, entry.path));
        rs.on('data', (chunk) => chunks.push(chunk));
        rs.on('end', () => resolve(Buffer.concat(chunks)));
        rs.on('error', reject);
      });
      fileBuffers.push(content);
    }
  }

  const archiveData = Buffer.concat([headerBuf, manifestBuf, ...fileBuffers]);
  const readable = Readable.from([archiveData]);
  const brotli = createBrotliCompress();
  const output = createWriteStream(path.join(compressedPath, 'archive.br'));

  await pipeline(readable, brotli, output);
};

await compressDir();
