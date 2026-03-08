import fs from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import path from 'node:path';
import { createBrotliDecompress } from 'node:zlib';
import { Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const decompressDir = async () => {
  const sourceDir = path.resolve('workspace/compressed');
  const destDir = path.resolve('workspace/decompressed');
  const archivePath = path.join(sourceDir, 'archive.br');

  try {
    const stat = await fs.stat(archivePath);
    if (!stat.isFile()) {
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

  let buffer = Buffer.alloc(0);
  let state = 'READ_TYPE';

  let entryType = 0;
  let pathLen = 0;
  let filePath = '';
  let fileLen = 0n;
  let bytesWritten = 0n;
  let fileStream = null;

  const extractStream = new Writable({
    async write(chunk, enc, cb) {
      buffer = Buffer.concat([buffer, chunk]);

      try {
        while (buffer.length > 0) {
          if (state === 'READ_TYPE') {
            if (buffer.length < 1) break;
            entryType = buffer.readUInt8(0);
            buffer = buffer.subarray(1);
            state = 'READ_PATH_LEN';
          } else if (state === 'READ_PATH_LEN') {
            if (buffer.length < 2) break;
            pathLen = buffer.readUInt16LE(0);
            buffer = buffer.subarray(2);
            state = 'READ_PATH';
          } else if (state === 'READ_PATH') {
            if (buffer.length < pathLen) break;
            filePath = buffer.subarray(0, pathLen).toString('utf8');
            buffer = buffer.subarray(pathLen);

            const destPath = path.join(destDir, filePath);
            if (entryType === 0) {
              await fs.mkdir(destPath, { recursive: true });
              state = 'READ_TYPE';
            } else {
              await fs.mkdir(path.dirname(destPath), { recursive: true });
              state = 'READ_FILE_LEN';
            }
          } else if (state === 'READ_FILE_LEN') {
            if (buffer.length < 8) break;
            fileLen = buffer.readBigUInt64LE(0);
            buffer = buffer.subarray(8);

            const destPath = path.join(destDir, filePath);
            fileStream = createWriteStream(destPath);
            bytesWritten = 0n;
            if (fileLen === 0n) {
              await new Promise((resolve) => fileStream.end(resolve));
              fileStream = null;
              state = 'READ_TYPE';
            } else {
              state = 'READ_FILE';
            }
          } else if (state === 'READ_FILE') {
            const remaining = fileLen - bytesWritten;
            const toWriteSize = Number(
              remaining > BigInt(buffer.length) ? BigInt(buffer.length) : remaining,
            );
            const toWriteBuf = buffer.subarray(0, toWriteSize);

            await new Promise((resolve, reject) => {
              if (!fileStream.write(toWriteBuf)) {
                fileStream.once('drain', resolve);
                fileStream.once('error', reject);
              } else {
                resolve();
              }
            });

            bytesWritten += BigInt(toWriteSize);
            buffer = buffer.subarray(toWriteSize);

            if (bytesWritten === fileLen) {
              await new Promise((resolve) => fileStream.end(resolve));
              fileStream = null;
              state = 'READ_TYPE';
            }
          }
        }
        cb();
      } catch (err) {
        cb(err);
      }
    },
    async final(cb) {
      if (fileStream) {
        await new Promise((resolve) => fileStream.end(resolve));
      }
      cb();
    },
  });

  const readStream = createReadStream(archivePath);
  const brotliStream = createBrotliDecompress();

  try {
    await pipeline(readStream, brotliStream, extractStream);
  } catch (err) {
    throw new Error('FS operation failed');
  }
};

await decompressDir();
