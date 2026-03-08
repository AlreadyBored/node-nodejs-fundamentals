import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';
import { createBrotliCompress } from 'zlib';

const WORKSPACE = path.join(process.cwd(), 'workspace');
const SRC_DIR = path.join(WORKSPACE, 'toCompress');
const OUT_DIR = path.join(WORKSPACE, 'compressed');
const ARCHIVE = path.join(OUT_DIR, 'archive.br');

async function* walk(dir, base) {
  let entries;
  try {
    entries = await fsPromises.readdir(dir, { withFileTypes: true });
  } catch {
    throw new Error('FS operation failed');
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(base, fullPath).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      yield* walk(fullPath, base);
    } else if (entry.isFile()) {
      yield { relPath, fullPath };
    }
  }
}

const compressDir = async () => {
  try {
    await fsPromises.access(SRC_DIR);
  } catch {
    throw new Error('FS operation failed');
  }

  await fsPromises.mkdir(OUT_DIR, { recursive: true });

  const archiveStream = fs.createWriteStream(ARCHIVE);
  const brotli = createBrotliCompress();

  const writer = async () => {
    for await (const { relPath, fullPath } of walk(SRC_DIR, SRC_DIR)) {
      const stat = await fsPromises.stat(fullPath);
      archiveStream.write(relPath + '\n');
      archiveStream.write(stat.size + '\n');
      await pipeline(
        fs.createReadStream(fullPath),
        archiveStream,
      );
    }
    archiveStream.end();
  };

  await pipeline(
    async function* () {
      await writer();
    }(),
    brotli,
    fs.createWriteStream(ARCHIVE)
  );
};

await compressDir();