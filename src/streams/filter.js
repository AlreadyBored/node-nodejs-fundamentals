import { Transform, pipeline } from "stream";
import { createInterface } from "readline";

const filter = () => {
  const args = process.argv.slice(2);
  let pattern = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--pattern") {
      pattern = args[i + 1];
      break;
    }
  }

  if (!pattern) {
    console.error("Usage: node filter.js --pattern <string>");
    process.exit(1);
  }

  const filterStream = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(chunk, _, callback) {
      const line = chunk.toString();
      if (line.includes(pattern)) {
        this.push(line + "\n");
      }
      callback();
    },
  });

  const rl = createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });

  pipeline(rl, filterStream, process.stdout, (err) => {
    if (err) console.error("Pipeline failed:", err);
  });
};

filter();
