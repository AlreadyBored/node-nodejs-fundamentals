import { Transform } from "stream";
import { pipeline } from "stream/promises";
// IMPORTANT: for Windows users!
// Change npm command in package.json to "streams:lineNumberer": "node src/streams/lineNumberer.js"
// Run then the command in terminal:
//
// echo "hello
// world" | npm run streams:lineNumberer
//
// Otherwise, it doesn't work

const createLineNumbererStream = () => {
  let lineNumber = 1;
  let buffer = "";

  return new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString().replace(/\r/g, "");

      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        this.push(`${lineNumber++}| ${line}\n`);
      }

      callback();
    },
  });
};

const lineNumberer = () => {
  // Write your code here
  // Read from process.stdin
  // Use Transform Stream to prepend line numbers
  // Write to process.stdout

  const transformStream = createLineNumbererStream();

  pipeline(process.stdin, transformStream, process.stdout);
};

lineNumberer();
