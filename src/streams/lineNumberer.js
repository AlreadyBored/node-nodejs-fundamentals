import { stdin as input, stdout as output } from "node:process";
import { Transform, pipeline } from "node:stream";

const lineNumberer = () => {
  let lineNumber = 1;

  const transform = new Transform({
    transform(chunk, _, callback) {
      console.log('chunk', chunk.toString())
      const tmp = chunk.toString();

      const lines = tmp.split("\n");

      for (const line of lines) {
        this.push(`${lineNumber++} | ${line}\n`);
      }

      callback();
    },
  });

  pipeline(input, transform, output, (err) => {
    if (err) {
      console.error("Pipeline failed.", err);
    } else {
      console.log("Pipeline succeeded.");
    }
  });
};

lineNumberer();
