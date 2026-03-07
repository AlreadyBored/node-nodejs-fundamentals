import fs from 'node:fs';
import path from 'node:path';
import { Transform } from 'node:stream';

const split = async () => {
  const linesIndex = process.argv.indexOf('--lines');
  const maxLines =
    linesIndex !== -1 && process.argv[linesIndex + 1]
      ? Number(process.argv[linesIndex + 1])
      : 10;

  const sourcePath = path.join(process.cwd(), 'source.txt');

  if (!fs.existsSync(sourcePath)) {
    throw new Error('FS operation failed');
  }

  let chunkIndex = 1;
  let lineCount = 0;
  let buffer = '';
  let currentWriteStream = null;

  const startChunk = () => {
    const chunkPath = path.join(process.cwd(), `chunk_${chunkIndex}.txt`);
    currentWriteStream = fs.createWriteStream(chunkPath);
    chunkIndex += 1;
    lineCount = 0;
  };

  const transform = new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (lineCount === 0) {
          startChunk();
        }
        currentWriteStream.write(line + '\n');
        lineCount += 1;
        if (lineCount >= maxLines) {
          currentWriteStream.end();
          currentWriteStream = null;
          lineCount = 0;
        }
      }
      callback();
    },
    flush(callback) {
      const done = () => {
        if (currentWriteStream && !currentWriteStream.writableFinished) {
          currentWriteStream.once('finish', callback);
          currentWriteStream.end();
        } else {
          callback();
        }
      };
      if (buffer !== '') {
        if (lineCount === 0) {
          startChunk();
        }
        currentWriteStream.write(buffer + '\n');
        lineCount += 1;
      }
      done();
    },
  });

  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(sourcePath);
    transform.on('finish', resolve);
    transform.on('error', reject);
    readStream.pipe(transform);
  });
};

await split();
