import { Transform } from 'node:stream';

const lineNumberer = () => {
  // Write your code here
  // Read from process.stdin
  // Use Transform Stream to prepend line numbers
  // Write to process.stdout
  let buffer = '';
  let lineNumber = 1;

  const lineNumberTransform = new Transform({
    decodeStrings: false,
    transform(chunk, _encoding, callback) {
      const chunkText = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
      buffer += chunkText;

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        this.push(`${lineNumber}: ${line}\n`);
        lineNumber += 1;
      }

      callback();
    },
    flush(callback) {
      debugger;
      if (buffer.length > 0) {
        this.push(`${lineNumber}: ${buffer}`);
      }

      callback();
    }
  });

  process.stdin.setEncoding('utf8');
  process.stdin.pipe(lineNumberTransform).pipe(process.stdout);
};

lineNumberer();
