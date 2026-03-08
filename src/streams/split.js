import { createReadStream, createWriteStream } from 'fs';
import { join } from 'path';

const split = async () => {
  const linesIdx = process.argv.indexOf('--lines');
  const maxLines = linesIdx !== -1 && process.argv[linesIdx + 1]
    ? parseInt(process.argv[linesIdx + 1], 10) || 10
    : 10;

  const sourcePath = join(process.cwd(), 'source.txt');

  const stream = createReadStream(sourcePath);
  let buffer = '';
  let chunkNum = 1;
  let lineCount = 0;
  let currentChunk = [];
  const writePromises = [];

  const writeChunk = (lines) => {
    const p = new Promise((resolve, reject) => {
      const chunkPath = join(process.cwd(), `chunk_${chunkNum}.txt`);
      const ws = createWriteStream(chunkPath);
      ws.write(lines.join('\n') + (lines.length ? '\n' : ''));
      ws.end();
      chunkNum++;
      ws.on('finish', resolve);
      ws.on('error', reject);
    });
    writePromises.push(p);
  };

  await new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (lineCount === maxLines) {
          writeChunk(currentChunk);
          currentChunk = [];
          lineCount = 0;
        }
        currentChunk.push(line);
        lineCount++;
      }
    });

    stream.on('end', () => {
      if (buffer) {
        if (lineCount === maxLines) {
          writeChunk(currentChunk);
          currentChunk = [];
          lineCount = 0;
        }
        currentChunk.push(buffer);
        lineCount++;
      }
      if (currentChunk.length > 0) {
        writeChunk(currentChunk);
      }
      resolve();
    });

    stream.on('error', reject);
  });

  await Promise.all(writePromises);
};

await split();
