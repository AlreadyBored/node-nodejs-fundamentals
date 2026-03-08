import { Transform, pipeline } from 'node:stream';

const lineNumberer = () => {
  let line = 1;
  let remainder = '';

  const t = new Transform({
    transform(chunk, enc, cb) {
      const text = remainder + chunk.toString();
      const lines = text.split('\n');
      remainder = lines.pop();

      const numbered = lines.map((l) => {
        const res = `${line} | ${l}`;
        line++;
        return res;
      });
      cb(null, numbered.join('\n') + '\n');
    },

    _flush(cb) {
      if (remainder) {
        cb(null, `${line} | ${remainder}\n`);
      } else {
        cb();
      }
    }
  });

  pipeline(process.stdin, t, process.stdout, (err) => {
    if (err) process.exit(1);
  });
};

lineNumberer();