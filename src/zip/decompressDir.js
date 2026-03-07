import { createReadStream, createWriteStream } from 'fs';
import { mkdir, access } from 'fs/promises';
import { createBrotliDecompress } from 'zlib';
import { pipeline } from 'stream/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const decompressDir = async () => {
  const compressedPath = path.join(__dirname, 'workspace', 'compressed');
  const archivePath = path.join(compressedPath, 'archive.br');
  const decompressedPath = path.join(__dirname, 'workspace', 'decompressed');

  try {
    await access(compressedPath);
    await access(archivePath);
  } catch {
    throw new Error('FS operation failed');
  }

  // Decompress archive into buffer
  const archiveData = await new Promise((resolve, reject) => {
    const chunks = [];
    const rs = createReadStream(archivePath);
    const brotli = createBrotliDecompress();
    rs.pipe(brotli);
    brotli.on('data', (chunk) => chunks.push(chunk));
    brotli.on('end', () => resolve(Buffer.concat(chunks)));
    brotli.on('error', reject);
    rs.on('error', reject);
  });

  // Parse manifest
  const manifestLength = archiveData.readUInt32BE(0);
  const manifest = JSON.parse(archiveData.subarray(4, 4 + manifestLength).toString('utf-8'));

  // Extract files
  let offset = 4 + manifestLength;

  await mkdir(decompressedPath, { recursive: true });

  for (const entry of manifest) {
    const targetPath = path.join(decompressedPath, entry.path);

    if (entry.type === 'directory') {
      await mkdir(targetPath, { recursive: true });
    } else {
      await mkdir(path.dirname(targetPath), { recursive: true });
      const content = archiveData.subarray(offset, offset + entry.size);
      offset += entry.size;

      await pipeline(
        (async function* () { yield content; })(),
        createWriteStream(targetPath)
      );
    }
  }
};

await decompressDir();
