import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
// Write your code here
// Read from process.stdin
// Use Transform Stream to prepend line numbers
// Write to process.stdout

const lineNumberer = async () => {
  let lineNumber = 1;
  let remainingData = "";

  const addNumbersTransform = new Transform({
    /**
     * The transform method processes each chunk of data.
     */
    transform(chunk, encoding, callback) {
      // Convert chunk to string and prepend any leftover data from the last chunk
      const data = remainingData + chunk.toString();
      const lines = data.split(/\r?\n/);

      // Keep the last element (it might be an incomplete line)
      remainingData = lines.pop();

      // Process complete lines
      const output = lines
        .map((line) => `${lineNumber++} | ${line}`)
        .join("\n");

      // Push the transformed data to the next stage of the pipeline
      if (output.length > 0) {
        this.push(output + "\n");
      }

      callback();
    },

    /**
     * flush is called when the input stream ends.
     */
    flush(callback) {
      // If there's any text left without a final newline, process it now
      if (remainingData.length > 0) {
        this.push(`${lineNumber++} | ${remainingData}\n`);
      }
      callback();
    },
  });

  try {
    // Pipeline connects stdin -> our transform -> stdout
    await pipeline(process.stdin, addNumbersTransform, process.stdout);
  } catch (error) {
    // Standard error handling for streams
    process.stderr.write("Stream operation failed!\n");
    process.exit(1);
  }
};

await lineNumberer();
