import { Transform } from 'stream';

const filter = () => {
  const patternIdx = process.argv.indexOf('--pattern');
  const pattern = patternIdx !== -1 && process.argv[patternIdx + 1]
    ? process.argv[patternIdx + 1]
    : '';

  let buffer = '';

  const transform = new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(line + '\n');
        }
      }
      callback();
    },
    flush(callback) {
      if (buffer && buffer.includes(pattern)) {
        this.push(buffer + '\n');
      }
      callback();
    },
  });

  process.stdin.pipe(transform).pipe(process.stdout);
};

filter();
