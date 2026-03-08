import { Transform } from 'node:stream';

const lineNumberer = () => {
  let buffer = '';
  let lineNum = 1;

  const numberStream = new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          this.push(`${lineNum.toString().padStart(2, '0')}: ${line}\n`);
          lineNum++;
        }
      }
      
      callback();
    },
    flush(callback) {
      if (buffer.trim()) {
        this.push(`${lineNum.toString().padStart(2, '0')}: ${buffer}\n`);
      }
      callback();
    }
  });

  process.stdin.pipe(numberStream).pipe(process.stdout);
};

lineNumberer();
