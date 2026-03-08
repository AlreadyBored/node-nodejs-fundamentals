import { createReadStream, createWriteStream } from 'fs';
import { resolve } from 'path';
import { Transform } from 'stream';

const split = () => {
  const sourcePath = resolve(process.cwd(), 'source.txt');
  let linesPerChunk = 10;
  const linesIndex = process.argv.indexOf('--lines');
  if (linesIndex !== -1 && process.argv[linesIndex + 1]) {
    linesPerChunk = parseInt(process.argv[linesIndex + 1]);
  }

  let currentChunk = 1;
  let lineCount = 0;
  let remaining = '';
  let writeStream = null;

  const createNextChunkStream = () => {
    if (writeStream) writeStream.end();
    writeStream = createWriteStream(resolve(process.cwd(), `chunk_${currentChunk++}.txt`));
  };

  createNextChunkStream();

  const transformStream = new Transform({
    transform(chunk, encoding, callback) {
      const lines = (remaining + chunk.toString()).split(/\r?\n/);
      remaining = lines.pop();

      for (const line of lines) {
        if (lineCount >= linesPerChunk) {
          createNextChunkStream();
          lineCount = 0;
        }
        writeStream.write(line + '\n');
        lineCount++;
      }
      callback();
    },
    flush(callback) {
      if (remaining) {
        if (lineCount >= linesPerChunk) {
          createNextChunkStream();
        }
        writeStream.write(remaining + '\n');
      }
      if (writeStream) writeStream.end();
      callback();
    },
  });

  createReadStream(sourcePath).pipe(transformStream);
};

split();
