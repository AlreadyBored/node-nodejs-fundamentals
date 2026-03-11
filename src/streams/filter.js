import { Transform } from 'node:stream';

const filter = () => {
  // Write your code here
  // Read from process.stdin
  // Filter lines by --pattern CLI argument
  // Use Transform Stream
  // Write to process.stdout
  const patternArgIndex = process.argv.indexOf('--pattern');
  const pattern = patternArgIndex >= 0 ? process.argv[patternArgIndex + 1] ?? '' : '';

  let buffer = '';
  const filterTransform = new Transform({
    decodeStrings: false,
    transform(chunk, _encoding, callback) {
      const chunkText = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
      buffer += chunkText;

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(`${line}\n`);
        }
      }

      callback();
    },
    flush(callback) {
      if (buffer.includes(pattern)) {
        this.push(buffer);
      }

      callback();
    }
  });

  process.stdin.setEncoding('utf8');
  process.stdin.pipe(filterTransform).pipe(process.stdout);
};

filter();
