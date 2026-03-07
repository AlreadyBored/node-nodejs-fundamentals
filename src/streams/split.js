import { createReadStream, createWriteStream } from 'fs';
import { Transform } from 'stream';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const split = async () => {
  const args = process.argv.slice(2);
  const linesIdx = args.indexOf('--lines');
  const maxLines = linesIdx !== -1 ? Number(args[linesIdx + 1]) : 10;

  const sourcePath = path.join(__dirname, 'source.txt');

  let chunkNumber = 1;
  let lineCount = 0;
  let writeStream = createWriteStream(path.join(__dirname, `chunk_${chunkNumber}.txt`));
  let buffer = '';

  await new Promise((resolve, reject) => {
    const transform = new Transform({
      transform(chunk, encoding, callback) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (lineCount >= maxLines) {
            writeStream.end();
            chunkNumber++;
            writeStream = createWriteStream(path.join(__dirname, `chunk_${chunkNumber}.txt`));
            lineCount = 0;
          }
          writeStream.write(line + '\n');
          lineCount++;
        }

        callback();
      },
      flush(callback) {
        if (buffer.length > 0) {
          if (lineCount >= maxLines) {
            writeStream.end();
            chunkNumber++;
            writeStream = createWriteStream(path.join(__dirname, `chunk_${chunkNumber}.txt`));
          }
          writeStream.write(buffer);
        }
        writeStream.end();
        callback();
      },
    });

    const readStream = createReadStream(sourcePath);
    readStream.pipe(transform);
    transform.on('finish', resolve);
    transform.on('error', reject);
    readStream.on('error', reject);
  });
};

await split();
