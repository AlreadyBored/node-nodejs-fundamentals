import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const lineNumberer = async () => {
  let lineNumber = 1;
  let buffer = '';

  const transform = new Transform({
    transform(chunk, enc, cb) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        this.push(`${lineNumber} | ${line}\n`);
        lineNumber++;
      }
      cb();
    },
    flush(cb) {
      if (buffer) {
        this.push(`${lineNumber} | ${buffer}\n`);
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

await lineNumberer();
