import { join, relative } from 'path';
import { readdir, readFile, mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { createBrotliCompress } from 'zlib';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';



const toCompressPath = join(process.cwd(), 'workspace', 'toCompress');
const compressedDir = join(process.cwd(), 'workspace', 'compressed');
const archivePath = join(compressedDir, 'archive.br');

const entries = async () => {
  try {
    const fileDirents = await readdir(toCompressPath, { withFileTypes: true, recursive: true });

    const entries = await Promise.all(
      fileDirents.map(async (file) => {
        const fullPath = join(file.parentPath, file.name);
      
        const entry = {
          path: relative(toCompressPath, fullPath),
          type: file.isFile() ? 'file' : 'directory',
        }

        if (file.isFile()) {
          const content = await readFile(fullPath);
          entry.content = content.toString();
        }

        return entry;
      })
    );
    
    return JSON.stringify({ entries });
  } catch {
    throw new Error('FS operation failed')
  }
};

const compressDir = async () => {
  try {
    const toCompressEntries = await entries();
    await mkdir(compressedDir, { recursive: true });

    const readStream = Readable.from(Buffer.from(toCompressEntries, 'utf-8'));
    const zip = createBrotliCompress();
    const writeStream = createWriteStream(archivePath);

    await pipeline(readStream, zip, writeStream);
  } catch {
    throw new Error('FS operation failed');
  }
};

await compressDir();
