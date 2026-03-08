import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

const getLinesArg = () => {
  const idx = process.argv.indexOf('--lines');
  if (idx !== -1 && process.argv[idx + 1]) {
    const n = Number(process.argv[idx + 1]);
    if (!isNaN(n) && n > 0) return n;
  }
  return 10;
};

const split = async () => {
  const LINES_PER_CHUNK = getLinesArg();
  const srcPath = path.join(process.cwd(), 'source.txt');
  let src;
  try {
    src = fs.createReadStream(srcPath, { encoding: 'utf-8' });
  } catch {
    throw new Error('FS operation failed');
  }

  let chunkIdx = 1;
  let lineBuffer = [];
  let leftover = '';
  let writers = [];

  src.on('data', chunk => {
    const data = leftover + chunk;
    const lines = data.split('\n');
    leftover = lines.pop();
    for (const line of lines) {
      lineBuffer.push(line);
      if (lineBuffer.length === LINES_PER_CHUNK) {
        const chunkFile = path.join(process.cwd(), `chunk_${chunkIdx++}.txt`);
        writers.push(fsPromises.writeFile(chunkFile, lineBuffer.join('\n') + '\n'));
        lineBuffer = [];
      }
    }
  });

  src.on('end', async () => {
    if (leftover) lineBuffer.push(leftover);
    if (lineBuffer.length > 0) {
      const chunkFile = path.join(process.cwd(), `chunk_${chunkIdx++}.txt`);
      writers.push(fsPromises.writeFile(chunkFile, lineBuffer.join('\n') + '\n'));
    }
    await Promise.all(writers);
  });

  src.on('error', () => {
    throw new Error('FS operation failed');
  });
};

await split();