import { Transform } from 'stream';

const filter = () => {
  let pattern = '';
  const patternIndex = process.argv.indexOf('--pattern');
  if (patternIndex !== -1 && process.argv[patternIndex + 1]) {
    pattern = process.argv[patternIndex + 1];
  }

  let remaining = '';

  const transformStream = new Transform({
    transform(chunk, encoding, callback) {
      const lines = (remaining + chunk.toString()).split(/\r?\n/);
      remaining = lines.pop();

      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(line + '\n');
        }
      }
      callback();
    },
    flush(callback) {
      if (remaining && remaining.includes(pattern)) {
        this.push(remaining + '\n');
      }
      callback();
    },
  });

  process.stdin.pipe(transformStream).pipe(process.stdout);
};

filter();
