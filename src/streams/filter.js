import { Transform, pipeline } from 'stream';
import process from 'process';

const getPattern = () => {
  const idx = process.argv.indexOf('--pattern');
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1];
  }
  return '';
};

const filter = () => {
  const pattern = getPattern();
  if (!pattern) {
    process.exit(0);
  }
  let leftover = '';
  const filterStream = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split('\n');
      leftover = lines.pop();
      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(line + '\n');
        }
      }
      callback();
    },
    flush(callback) {
      if (leftover && leftover.includes(pattern)) {
        this.push(leftover + '\n');
      }
      callback();
    }
  });

  pipeline(process.stdin, filterStream, process.stdout, (err) => {
    if (err) process.exit(1);
  });
};

filter();