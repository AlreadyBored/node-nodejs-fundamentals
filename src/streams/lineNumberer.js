import { pipeline, Transform } from "stream";

const lineNumberer = () => {
  let lineNumber = 1;
  let buffer = '';

  const transform = new Transform({
    transform(chunk, _, cb) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      const res = lines
        .map((value) => `${lineNumber++} | ${value}\n`)
        .join('');

      cb(null, res);
    },
    flush(cb) {
      if (buffer.length > 0) {
        cb(null, `${lineNumber++} | ${buffer}`);
        return;
      }
      cb();
    }
  });

  pipeline(process.stdin, transform, process.stdout, () => {});
};

lineNumberer();

