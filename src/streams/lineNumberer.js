import { Transform, pipeline } from 'stream';
import process from 'process';

const lineNumberer = () => {
  let leftover = '';
  let lineNum = 1;
  const numberStream = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split('\n');
      leftover = lines.pop();
      for (const line of lines) {
        this.push(`${lineNum++} | ${line}\n`);
      }
      callback();
    },
    flush(callback) {
      if (leftover) {
        this.push(`${lineNum++} | ${leftover}\n`);
      }
      callback();
    }
  });

  pipeline(process.stdin, numberStream, process.stdout, (err) => {
    if (err) process.exit(1);
  });
};

lineNumberer();