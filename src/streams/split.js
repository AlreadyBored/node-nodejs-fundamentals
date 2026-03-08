import fs from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import path from 'node:path';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const getLinesArg = () => {
  const argIndex = process.argv.findIndex((arg) => arg === '--lines');
  if (argIndex !== -1 && process.argv[argIndex + 1]) {
    return parseInt(process.argv[argIndex + 1], 10) || 10;
  }
  return 10;
};

const split = async () => {
  const maxLines = getLinesArg();
  let sourcePath = path.resolve('source.txt');

  try {
    await fs.access(sourcePath);
  } catch {
    sourcePath = path.join(import.meta.dirname, 'source.txt');
  }

  const destDir = path.dirname(sourcePath);

  let lineCount = 0;
  let chunkCount = 1;
  let buffer = '';
  let activeWriteStream = null;

  const getWriteStream = () => {
    if (!activeWriteStream) {
      activeWriteStream = createWriteStream(path.join(destDir, `chunk_${chunkCount}.txt`));
    }
    return activeWriteStream;
  };

  const closeCurrentStream = async () => {
    return new Promise((resolve) => {
      if (activeWriteStream) {
        activeWriteStream.end(() => {
          activeWriteStream = null;
          chunkCount++;
          lineCount = 0;
          resolve();
        });
      } else {
        resolve();
      }
    });
  };

  const writeStreamWrapper = new Transform({
    async transform(chunk, enc, cb) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Re-assigning last incomplete line to buffer

      for (let i = 0; i < lines.length; i++) {
        const stream = getWriteStream();

        // Handling writing lines properly
        stream.write(`${lines[i]}\n`);

        lineCount++;
        if (lineCount >= maxLines) {
          await closeCurrentStream();
        }
      }
      cb();
    },
    async flush(cb) {
      if (buffer) {
        const stream = getWriteStream();
        stream.write(buffer);
      }
      await closeCurrentStream();
      cb();
    },
  });

  const readStream = createReadStream(sourcePath);
  readStream.on('error', () => {
    console.error('FS operation failed');
    process.exit(1);
  });

  try {
    await pipeline(readStream, writeStreamWrapper);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('FS operation failed');
      process.exit(1);
    } else {
      console.error(err);
    }
  }
};

await split();
