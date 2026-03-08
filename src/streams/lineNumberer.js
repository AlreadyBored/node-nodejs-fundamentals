import { Transform } from "node:stream";

const lineNumberer = () => {
  // Write your code here
  // Read from process.stdin
  // Use Transform Stream to prepend line numbers
  // Write to process.stdout

  let lineCount = 0;

  const transform = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split("\n");
      const numbered = lines
        .map((line) => (line ? `${++lineCount}: ${line}` : ""))
        .join("\n");
      this.push(numbered + "\n");
      callback();
    },
  });

  process.stdin.pipe(transform).pipe(process.stdout);
};

lineNumberer();
