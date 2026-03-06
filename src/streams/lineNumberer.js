import { Transform } from "stream";

const lineNumberer = () => {
  let lineNumber = 1;
  let leftover = "";

  const transformer = new Transform({
    transform(chunk, _encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split("\n");

      leftover = lines.pop();

      const formattedLines = lines
        .map((line) => `${lineNumber++} | ${line}`)
        .join("\n");

      this.push(formattedLines + "\n");
      callback();
    },

    flush(callback) {
      if (leftover) {
        this.push(`${lineNumber++} | ${leftover}\n`);
      }
      callback();
    },
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

lineNumberer();
