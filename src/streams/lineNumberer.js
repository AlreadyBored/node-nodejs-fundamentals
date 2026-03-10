import { Transform } from "stream";

const lineNumberer = () => {
  // Write your code here
  // Read from process.stdin
  // Use Transform Stream to prepend line numbers
  // Write to process.stdout
  let buffer = "";
  let lineNumber = 1;
  const lineTransform = new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();
      const result =
        lines.map((line, index) => `${lineNumber++}: ${line}`).join("\n") +
        "\n";
      callback(null, result);
    },
    flush(callback) {
      if (buffer.length > 0) {
        this.push(`${lineNumber++}: ${buffer}\n`);
      }
      callback();
    },
  });
  process.stdin.pipe(lineTransform).pipe(process.stdout);
};

lineNumberer();
