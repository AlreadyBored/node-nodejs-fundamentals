import { Transform } from 'stream';

const lineNumberer = () => {
  let leftover = '';
  let lineNumber = 1;

  const numberer = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split('\n');
      leftover = lines.pop(); 
      for (const line of lines) {
        this.push(`${lineNumber} | ${line}\n`);
        lineNumber++;
      }
      callback();
    },
    flush(callback) {
      if (leftover) {
        this.push(`${lineNumber} | ${leftover}\n`);
      }
      callback();
    }
  });

  process.stdin.pipe(numberer).pipe(process.stdout);
};

lineNumberer();