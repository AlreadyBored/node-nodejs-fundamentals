import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const linesArgIndex = process.argv.indexOf('--lines');
let maxLines = 10;
if (linesArgIndex !== -1 && process.argv[linesArgIndex + 1]) {
  const parsed = parseInt(process.argv[linesArgIndex + 1], 10);
  if (!isNaN(parsed) && parsed > 0) {
    maxLines = parsed;
  }
}

const split = async () => {
  const baseDir = path.join(__dirname, '../../');
  const sourcePath = path.join(baseDir, 'source.txt');

  try {
    await fsp.access(sourcePath);
  } catch {
    throw new Error('FS operation failed');
  }

  let chunkIndex = 1;
  let lineBuffer = [];
  let leftover = '';

  const readStream = fs.createReadStream(sourcePath, { encoding: 'utf8' });

  readStream.on('data', chunk => {
    const data = leftover + chunk;
    const lines = data.split('\n');
    leftover = lines.pop(); 

    for (const line of lines) {
      lineBuffer.push(line);
      if (lineBuffer.length === maxLines) {
        const chunkFile = path.join(baseDir, `chunk_${chunkIndex}.txt`);
        fs.writeFileSync(chunkFile, lineBuffer.join('\n') + '\n', 'utf8');
        chunkIndex++;
        lineBuffer = [];
      }
    }
  });

  readStream.on('end', () => {
    if (leftover) {
      lineBuffer.push(leftover);
    }
    if (lineBuffer.length > 0) {
      const chunkFile = path.join(baseDir, `chunk_${chunkIndex}.txt`);
      fs.writeFileSync(chunkFile, lineBuffer.join('\n') + '\n', 'utf8');
    }
  });

  readStream.on('error', () => {
    throw new Error('FS operation failed');
  });
};

await split(); 