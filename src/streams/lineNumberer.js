import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

const lineNumberer = () => {
  let lineCount = 1;
  let leftover = "";

  const numberTransform = new Transform({
    transform(chunk, encoding, callback) {
      const text = leftover + chunk.toString();

      const lines = text.split("\n");
      leftover = lines.pop();

      for (const line of lines) {
        this.push(`${lineCount} | ${line}\n`);
        lineCount++;
      }

      callback();
    },
    flush(callback) {
      if (leftover) {
        this.push(`${lineCount} | ${leftover}\n`);
      }
      callback();
    },
  });

  pipeline(process.stdin, numberTransform, process.stdout).catch((err) =>
    console.error(err),
  );
};

lineNumberer();
