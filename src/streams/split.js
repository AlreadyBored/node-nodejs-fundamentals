import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createReadStream, createWriteStream } from 'node:fs';
import { Transform } from 'node:stream';

const split = async () => {
  const { argv, exit } = process;

  const DEFAULT_LINE_LIMIT = 10;

  const currentFilePath = fileURLToPath(import.meta.url);
  const rootPath = join(currentFilePath, '..', '..', '..', 'source.txt');

  const args = argv.slice(2);
  const chunkLineLimitArgIndex = args.indexOf('--lines');
  let chunkLineLimit = DEFAULT_LINE_LIMIT;

  if (chunkLineLimitArgIndex !== -1 || (chunkLineLimitArgIndex + 1) < args.length) {
    chunkLineLimit = parseInt(args[chunkLineLimitArgIndex + 1], 10);
  }

  if (!Number.isInteger(chunkLineLimit) || chunkLineLimit <= 0) {
    console.error('Invalid line count. Must be a positive integer.');
    exit(1);
  }

  const readStream = createReadStream(rootPath, { encoding: 'utf8' });
  
  const writeChunk = (chunkContent, chunkNumber) => {
    const writeChunkStream = createWriteStream(
      join(currentFilePath, '..', '..', '..', `chunk_${chunkNumber}.txt`),
      { flags: 'a' },
    );

    writeChunkStream.write(chunkContent);
    writeChunkStream.end();
  };

  let chunkNumber = 1;
  let chunkLineNumber = 0;
  let chunkLines = [];

  const splitStream = new Transform({
    transform(data, _, callback) {
      const lines = data.toString().split('\n');
      
      for (const line of lines) {
        chunkLineNumber++;
        chunkLines.push(line);

        if (chunkLineNumber === chunkLineLimit) {
          writeChunk(chunkLines.join('\n'), chunkNumber);

          chunkNumber++;
          chunkLineNumber = 0;
          chunkLines = [];
        }
      }

      callback();
    },
    flush(callback) {
      if (chunkLines.length) {
        writeChunk(chunkLines.join('\n'), chunkNumber);
      }

      callback();
    }
  });

  readStream.pipe(splitStream);
};

await split();
