import { Transform } from 'node:stream';

const lineNumberer = () => {
  // Write your code here
  // Read from process.stdin
  // Use Transform Stream to prepend line numbers
  // Write to process.stdout

  let lineNumber = 1;
  let leftover = '';

  const lineNumberer = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split(/\r?\n/);

      leftover = lines.pop();

      const numbered = lines
        .map(line => `${lineNumber++} | ${line}`)
        .join('\n');

      callback(null, numbered + (numbered ? '\n' : ''));
    },
    flush(callback) {
      if (leftover) {
        this.push(`${lineNumber++} | ${leftover}\n`);
      }
      callback();
    }
  });

  process.stdin.pipe(lineNumberer).pipe(process.stdout);
};

lineNumberer();
