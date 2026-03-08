import { Transform } from 'stream';

const patternIndex = process.argv.indexOf('--pattern');
let pattern = '';
if (patternIndex !== -1 && process.argv[patternIndex + 1]) {
  pattern = process.argv[patternIndex + 1];
}

const filter = () => {
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

  process.stdin.pipe(filterStream).pipe(process.stdout);
};

filter();