import { Transform } from 'stream';

const lineNumberer = () => {
  let lineNumber = 1;

    const transform = new Transform({
    transform(chunk, encoding, callback) {
      const text = chunk.toString();
      const lines = text.split('\n');

      let result = '';
      for (let i = 0; i < lines.length; i++) {
        if (i === lines.length - 1 && lines[i] === '') {
          break;
        }
        result += `${lineNumber} | ${lines[i]}`;
        if (i < lines.length - 1) {
          result += '\n';
        }
        lineNumber++;
      }

      callback(null, result);
    },
    flush(callback) {
      callback(null, '\n');
    }
  });

  process.stdin.pipe(transform).pipe(process.stdout);
};

lineNumberer();
