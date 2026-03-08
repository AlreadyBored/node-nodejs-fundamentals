import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';
import { pipeline, Writable } from 'stream';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pipe = promisify(pipeline);

const decompressDir = async () => {
  const baseDir = path.join(__dirname, '../../');
  const compressedDir = path.join(baseDir, 'workspace/compressed');
  const archivePath = path.join(compressedDir, 'archive.br');
  const destDir = path.join(baseDir, 'workspace/decompressed');

  try {
    await fsp.access(compressedDir);
    await fsp.access(archivePath);
  } catch {
    throw new Error('FS operation failed');
  }

  try {
    await fsp.mkdir(destDir, { recursive: true });
  } catch {
    throw new Error('FS operation failed');
  }

  let archiveObj;
  try {
    const chunks = [];
    await pipe(
      fs.createReadStream(archivePath),
      zlib.createBrotliDecompress(),
      new Writable({
        write(chunk, encoding, callback) {
          chunks.push(chunk);
          callback();
        }
      })
    );
    const jsonStr = Buffer.concat(chunks).toString('utf8');
    archiveObj = JSON.parse(jsonStr);
  } catch {
    throw new Error('FS operation failed');
  }

  for (const entry of archiveObj) {
    const entryPath = path.join(destDir, entry.path);
    if (entry.type === 'directory') {
      try {
        await fsp.mkdir(entryPath, { recursive: true });
      } catch {
        throw new Error('FS operation failed');
      }
    } else if (entry.type === 'file') {
      await fsp.mkdir(path.dirname(entryPath), { recursive: true });
      try {
        const content = Buffer.from(entry.content, 'base64');
        await fsp.writeFile(entryPath, content);
      } catch {
        throw new Error('FS operation failed');
      }
    }
  }
};

await decompressDir();