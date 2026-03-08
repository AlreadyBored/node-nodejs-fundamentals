import { Transform } from "stream";

const filter = () => {
  // Write your code here
  // Read from process.stdin
  // Filter lines by --pattern CLI argument
  // Use Transform Stream
  // Write to process.stdout

  let buffer = "";
  const filterTransform = new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();
      const patternIndex = process.argv.indexOf("--pattern");
      const pattern = process.argv[patternIndex + 1] || "";
      const result =
        lines.filter((line) => line.includes(pattern)).join("\n") + "\n";
      callback(null, result);
    },
    flush(callback) {
      if (buffer && buffer.includes(pattern)) {
        this.push(buffer + "\n");
      }
      callback();
    },
  });
  process.stdin.pipe(filterTransform).pipe(process.stdout);
};

filter();
