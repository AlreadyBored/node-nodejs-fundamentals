import { Transform, pipeline } from "stream";
import { createInterface } from "readline";

const lineNumberer = () => {
  let lineNumber = 1;

  const numberLines = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(chunk, _, callback) {
      const line = chunk.toString();
      this.push(`${lineNumber} | ${line}\n`);
      lineNumber++;
      callback();
    },
  });

  const rl = createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });

  pipeline(rl, numberLines, process.stdout, (err) => {
    if (err) {
      console.error("Pipeline failed:", err);
    }
  });
};

lineNumberer();
