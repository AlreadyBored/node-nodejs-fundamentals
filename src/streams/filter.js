import { Transform } from "node:stream";

const filter = () => {
  // Write your code here
  // Read from process.stdin
  // Filter lines by --pattern CLI argument
  // Use Transform Stream
  // Write to process.stdout
  const patternArg = process.argv.find((arg) => arg.startsWith("--pattern="));
  const pattern = patternArg ? patternArg.split("=")[1] : "";

  const transform = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split("\n");
      const filtered = lines
        .filter((line) => line.includes(pattern))
        .join("\n");
      this.push(filtered ? filtered + "\n" : "");
      callback();
    },
  });

  process.stdin.pipe(transform).pipe(process.stdout);
};

filter();
