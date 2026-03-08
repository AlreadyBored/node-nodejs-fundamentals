import { Transform } from 'node:stream';

const filter = () => {

const args = process.argv;
const patternIndex = args.indexOf('--pattern');
const pattern = patternIndex !== -1 ? args[patternIndex + 1] : '';

let remainder = '';

const t = new Transform({
  transform(chunk, enc, cb) {
    const text = remainder + chunk.toString();
    const lines = text.split('\n');
    remainder = lines.pop();

    const filtered = lines.filter((l) => {
      return l.includes(pattern);
    });

    cb(null, filtered.join('\n') + '\n');
  },

  _flush(cb) {
  if (remainder.includes(pattern)) {
    this.push(remainder + '\n');
  }
  cb();
}
});



process.stdin.pipe(t).pipe(process.stdout);
};


filter();
