import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { readdir, readFile, mkdir } from 'fs/promises';

const collectFiles = async (dir, base = dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath, base)));
    } else {
      const content = await readFile(fullPath);
      files.push({ path: path.relative(base, fullPath), content: content.toString('base64') });
    }
  }
  return files;
};

const compressDir = async () => {
  const sourceDir = path.join('workspace', 'toCompress');
  const destDir = path.join('workspace', 'compressed');
  await mkdir(destDir, { recursive: true });

  const files = await collectFiles(sourceDir);
  const json = JSON.stringify(files);

  await pipeline(
    Readable.from(json),
    zlib.createBrotliCompress(),
    fs.createWriteStream(path.join(destDir, 'archive.br')),
  );

  console.log('Compressed to workspace/compressed/archive.br');
};

await compressDir();
