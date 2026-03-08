import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

// Write your code here
// Read from process.stdin
// Filter lines by --pattern CLI argument
// Use Transform Stream
// Write to process.stdout

const filter = async () => {
  const args = process.argv;
  const patternIndex = args.indexOf("--pattern");

  // Requirement: Get the pattern or default to an empty string (shows everything)
  const pattern =
    patternIndex !== -1 && args[patternIndex + 1] ? args[patternIndex + 1] : "";

  let remainingData = "";

  const filterTransform = new Transform({
    /**
     * transform: Checks each line of the incoming chunk against the pattern.
     */
    transform(chunk, encoding, callback) {
      const data = remainingData + chunk.toString();
      const lines = data.split(/\r?\n/);

      // Save the last partial line for the next chunk
      remainingData = lines.pop();

      // We filter only the lines that include our pattern
      const filteredOutput = lines
        .filter((line) => line.includes(pattern))
        .join("\n");

      // Only push data if we found matches
      if (filteredOutput.length > 0) {
        this.push(filteredOutput + "\n");
      }

      callback();
    },

    /**
     * flush: Processes the final piece of data when the stream closes.
     */
    flush(callback) {
      if (remainingData.length > 0 && remainingData.includes(pattern)) {
        this.push(remainingData + "\n");
      }
      callback();
    },
  });

  try {
    // Pipeline connects keyboard input -> our filter -> terminal output
    await pipeline(process.stdin, filterTransform, process.stdout);
  } catch (error) {
    process.stderr.write("Stream filtering failed!\n");
    process.exit(1);
  }
};

await filter();
