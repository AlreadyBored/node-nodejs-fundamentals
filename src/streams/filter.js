import { Transform } from 'stream';

const filter = () => {
  const args = process.argv.slice(2);
  const patternIndex = args.indexOf('--pattern');

  if (patternIndex === -1 || !args[patternIndex + 1]) {
    console.error('Usage: node solution.js --pattern <string>');
    process.exit(1);
  }

  const pattern = args[patternIndex + 1];

  const filterStream = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split('\n');
      const matched = lines
        .filter(line => line.includes(pattern))
        .join('\n');

      if (matched) {
        callback(null, matched + '\n');
      } else {
        callback();
      }
    }
  });

  process.stdin.pipe(filterStream).pipe(process.stdout);
};

filter();
