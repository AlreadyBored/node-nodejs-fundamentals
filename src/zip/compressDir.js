import fs from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import path from 'node:path';
import { createBrotliCompress } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const compressDir = async () => {
  const sourceDir = path.resolve('workspace/toCompress');
  const destDir = path.resolve('workspace/compressed');
  const archivePath = path.join(destDir, 'archive.br');

  try {
    const stat = await fs.stat(sourceDir);
    if (!stat.isDirectory()) {
      throw new Error('FS operation failed');
    }
  } catch {
    throw new Error('FS operation failed');
  }

  try {
    await fs.mkdir(destDir, { recursive: true });
  } catch {
    throw new Error('FS operation failed');
  }

  const getEntries = async function* (dirPath, relPath) {
    let entries;
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
      entries.sort((a, b) => a.name.localeCompare(b.name));
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const entryRelPath = relPath ? `${relPath}/${entry.name}` : entry.name;

      const pathBuf = Buffer.from(entryRelPath, 'utf8');
      const pathLenBuf = Buffer.alloc(2);
      pathLenBuf.writeUInt16LE(pathBuf.length, 0);

      if (entry.isDirectory()) {
        const typeBuf = Buffer.alloc(1);
        typeBuf.writeUInt8(0, 0);
        yield typeBuf;
        yield pathLenBuf;
        yield pathBuf;

        yield* getEntries(fullPath, entryRelPath);
      } else if (entry.isFile()) {
        const typeBuf = Buffer.alloc(1);
        typeBuf.writeUInt8(1, 0);
        yield typeBuf;
        yield pathLenBuf;
        yield pathBuf;

        const stat = await fs.stat(fullPath);
        const sizeBuf = Buffer.alloc(8);
        sizeBuf.writeBigUInt64LE(BigInt(stat.size), 0);
        yield sizeBuf;

        const rs = createReadStream(fullPath);
        for await (const chunk of rs) {
          yield chunk;
        }
      }
    }
  };

  const writeStream = createWriteStream(archivePath);
  const brotliStream = createBrotliCompress();

  try {
    const readable = Readable.from(getEntries(sourceDir, ''));
    await pipeline(readable, brotliStream, writeStream);
  } catch (err) {
    throw new Error('FS operation failed');
  }
};

await compressDir();
