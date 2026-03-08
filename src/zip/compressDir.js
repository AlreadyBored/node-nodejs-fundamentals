import { createReadStream, createWriteStream, promises as fs } from 'fs';
import { resolve, join, relative } from 'path';
import { createBrotliCompress } from 'zlib';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const compressDir = async () => {
  const toCompressPath = resolve(process.cwd(), 'workspace', 'toCompress');
  const archivePath = resolve(process.cwd(), 'workspace', 'compressed', 'archive.br');

  try {
    const stats = await fs.stat(toCompressPath);
    if (!stats.isDirectory()) {
      throw new Error('FS operation failed');
    }
  } catch (error) {
    throw new Error('FS operation failed');
  }

  await fs.mkdir(resolve(process.cwd(), 'workspace', 'compressed'), { recursive: true });

  async function* archiver() {
    const scan = async function* (dir) {
      const files = await fs.readdir(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = join(dir, file.name);
        const relPath = relative(toCompressPath, fullPath).replace(/\\/g, '/');

        if (file.isDirectory()) {
          yield* scan(fullPath);
        } else if (file.isFile()) {
          const stats = await fs.stat(fullPath);
          const pathBuf = Buffer.from(relPath, 'utf8');
          
          // Header: path length (2 bytes) + path + file size (8 bytes)
          const header = Buffer.alloc(2 + pathBuf.length + 8);
          header.writeUInt16BE(pathBuf.length, 0);
          pathBuf.copy(header, 2);
          header.writeBigUInt64BE(BigInt(stats.size), 2 + pathBuf.length);
          
          yield header;
          
          const readStream = createReadStream(fullPath);
          for await (const chunk of readStream) {
            yield chunk;
          }
        }
      }
    };
    yield* scan(toCompressPath);
  }

  const brotli = createBrotliCompress();
  const output = createWriteStream(archivePath);

  await pipeline(Readable.from(archiver()), brotli, output);
};

compressDir().catch((err) => {
  if (err.message === 'FS operation failed') {
    throw err;
  }
});
