import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { mkdir, writeFile } from 'fs/promises';

const decompressDir = async () => {
  const archivePath = path.join('workspace', 'compressed', 'archive.br');
  const destDir = path.join('workspace', 'decompressed');
  await mkdir(destDir, { recursive: true });

  const json = await new Promise((resolve, reject) => {
    const chunks = [];
    const reader = fs.createReadStream(archivePath);
    const brotli = zlib.createBrotliDecompress();
    reader.pipe(brotli);
    brotli.on('data', (chunk) => chunks.push(chunk));
    brotli.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    brotli.on('error', reject);
    reader.on('error', reject);
  });

  const files = JSON.parse(json);

  for (const { path: filePath, content } of files) {
    const fullPath = path.join(destDir, filePath);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, Buffer.from(content, 'base64'));
  }

  console.log('Extracted to workspace/decompressed/');
};

await decompressDir();
