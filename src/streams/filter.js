import { Transform } from "stream";
import { pipeline } from "stream/promises";
import { parseArgs } from "util";

// IMPORTANT: for Windows users!
// Change npm command in package.json to "streams:filter": "node src/streams/filter.js --pattern test"
// Run then the command in terminal:
//
// echo "hello
// world
// test" | npm run streams:filter
//
// Otherwise, it doesn't work

const createFilterStream = (pattern) => {
  let buffer = "";

  return new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString().replace(/\r/g, "");

      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (line === pattern) {
          this.push(line + "\n");
        }
      }

      callback();
    }
  });
};

const filter = async () => {
  const args = parseArgs({
    options: {
      pattern: { type: "string" },
    },
  });

  const pattern = args.values.pattern;

  try {
    await pipeline(
      process.stdin,
      createFilterStream(pattern),
      process.stdout
    );
  } catch (err) {
    console.error("Pipeline failed:", err.message);
    process.exit(1);
  }
};

filter();