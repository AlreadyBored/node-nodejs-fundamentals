import { Transform } from 'stream';

const lineNumberer = () => {
  let lineNum = 1;
  let leftover = '';

  const transform = new Transform({
    transform(chunk, encoding, callback) {
      leftover += chunk.toString();
      const lines = leftover.split('\n');
      leftover = lines.pop();
      for (const line of lines) {
        this.push(`${lineNum}: ${line}\n`);
        lineNum++;
      }
      callback();
    },
    flush(callback) {
      if (leftover.length > 0) {
        this.push(`${lineNum}: ${leftover}\n`);
      }
      callback();
    },
  });

  process.stdin.pipe(transform).pipe(process.stdout);
};

lineNumberer();
