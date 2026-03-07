import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

const lineNumberer = () => {
  let lineNumber = 1;
  let remainder = "";

  const numberTransform = new Transform({
    transform(chunk, encoding, callback) {
      const text = remainder + chunk.toString();
      const lines = text.split("\n");
      remainder = lines.pop();

      for (const line of lines) {
        this.push(`${lineNumber} | ${line}\n`);
        lineNumber++;
      }

      callback();
    },

    flush(callback) {
      if (remainder.length > 0) {
        this.push(`${lineNumber} | ${remainder}`);
      }
      callback();
    },
  });

  pipeline(process.stdin, numberTransform, process.stdout).catch(() => {});
};

lineNumberer();
