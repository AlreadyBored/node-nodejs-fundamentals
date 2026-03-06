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


const transformStream = new Transform({
  transform(chunk, encoding, callback) {

    const transformedChunk = chunk
      .toString()
      .split("\n")
      .map((line, index) => `${index + 1}| ${line}`)
      .join("\n");

    callback(null, transformedChunk);
  },
});

const lineNumberer = () => {
  // Write your code here
  // Read from process.stdin
  // Use Transform Stream to prepend line numbers
  // Write to process.stdout

  pipeline(process.stdin, transformStream, process.stdout);
};

lineNumberer();
