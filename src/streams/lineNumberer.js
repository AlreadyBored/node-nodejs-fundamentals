import { Transform } from 'stream';

const lineNumberer = () => {
  let count = 1;
  let remaining = '';

  const transformStream = new Transform({
    transform(chunk, encoding, callback) {
      const lines = (remaining + chunk.toString()).split(/\r?\n/);
      remaining = lines.pop();

      for (const line of lines) {
        this.push(`${count++} | ${line}\n`);
      }
      callback();
    },
    flush(callback) {
      if (remaining) {
        this.push(`${count++} | ${remaining}\n`);
      }
      callback();
    },
  });

  process.stdin.pipe(transformStream).pipe(process.stdout);
};

lineNumberer();
