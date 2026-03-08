import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const getPattern = () => {
  const argIndex = process.argv.findIndex((arg) => arg === '--pattern');
  if (argIndex !== -1 && process.argv[argIndex + 1]) {
    return process.argv[argIndex + 1];
  }
  return '';
};

const filter = async () => {
  const pattern = getPattern();
  let buffer = '';

  const transform = new Transform({
    transform(chunk, enc, cb) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep last incomplete line
      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(`${line}\n`);
        }
      }
      cb();
    },
    flush(cb) {
      if (buffer && buffer.includes(pattern)) {
        this.push(`${buffer}\n`);
      }
      cb();
    },
  });

  try {
    await pipeline(process.stdin, transform, process.stdout);
  } catch (err) {
    if (err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      console.error(err);
    }
  }
};

await filter();
