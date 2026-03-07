import { createReadStream } from 'fs';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { pipeline } from 'stream/promises';
import { createBrotliDecompress } from 'zlib';
import { Writable } from 'stream';

const compressedDir = path.join(process.cwd(), 'workspace', 'compressed');
const archivePath = path.join(compressedDir, 'archive.br');
const decompressedDir = path.join(process.cwd(), 'workspace', 'decompressed');

const restore = async (snapshotJSON) => {
  const snapshot = JSON.parse(snapshotJSON);
  await mkdir(decompressedDir, { recursive: true });

  const dirs = snapshot.entries.filter((e) => e.type === 'directory');
  const files = snapshot.entries.filter((e) => e.type === 'file');

  await Promise.all(
    dirs.map((entry) => mkdir(path.join(decompressedDir, entry.path), { recursive: true }))
  );
  await Promise.all(
    files.map((entry) =>
      writeFile(path.join(decompressedDir, entry.path), entry.content)
    )
  );
};

const decompressDir = async () => {
  try {
    const readStream = createReadStream(archivePath);
    const decompress = createBrotliDecompress();

    const chunks = [];
    const collect = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(chunk);
        cb();
      },
      async final(cb) {
        const json = Buffer.concat(chunks).toString('utf-8');
        await restore(json);
        cb();
      },
    });

    await pipeline(readStream, decompress, collect);
  } catch {
    throw new Error('FS operation failed');
  }
};

await decompressDir();
