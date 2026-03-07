import { Transform } from "stream";

const lineNumberer = () => {
  let lineNumber = 1;
  let leftover = "";

  const transformStream = new Transform({
    transform(chunk, _encoding, callback) {
      const lines = (leftover + chunk.toString()).split(/\r?\n/);

      leftover = lines.pop() ?? "";

      for (const line of lines) {
        this.push(`${lineNumber++} | ${line}\n`);
      }

      callback();
    },

    flush(callback) {
      if (leftover) {
        this.push(`${lineNumber++} | ${leftover}\n`);
      }
      callback();
    },
  });

  process.stdin.pipe(transformStream).pipe(process.stdout);
};

lineNumberer();