import { Transform } from 'stream';

const lineNumberer = () => {
  let lineNum = 1;

  const transform = new Transform({
    transform(chunk, encoding, callback) {
      const str = chunk.toString();
      const lines = str.split('\n');

      for (let i = 0; i < lines.length; i++) {
        if (i === lines.length - 1 && !str.endsWith('\n')) {
          if (lines[i]) {
            this.push(`${lineNum} | ${lines[i]}`);
            lineNum++;
          }
          break;
        }
        this.push(`${lineNum} | ${lines[i]}\n`);
        lineNum++;
      }
      callback();
    },
  });

  process.stdin.pipe(transform).pipe(process.stdout);
};

lineNumberer();
