import { createReadStream, createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { createInterface } from "node:readline";

// Write your code here
// Read source.txt using Readable Stream
// Split into chunk_1.txt, chunk_2.txt, etc.
// Each chunk max N lines (--lines CLI argument, default: 10)

const split = async () => {
  const sourcePath = resolve(process.cwd(), "source.txt");
  const args = process.argv;
  const linesIndex = args.indexOf("--lines");

  // Requirement: Default to 10 lines if --lines is not provided
  const linesPerChunk =
    linesIndex !== -1 && args[linesIndex + 1]
      ? parseInt(args[linesIndex + 1])
      : 10;

  try {
    // 1. Initial validation: Check if source.txt exists
    await stat(sourcePath);

    // 2. Create a Readable Stream to read source.txt
    const readable = createReadStream(sourcePath);

    // 3. Use readline interface to process the stream line by line
    const rl = createInterface({
      input: readable,
      crlfDelay: Infinity,
    });

    let currentLineCount = 0;
    let chunkIndex = 1;
    let currentWriteStream = null;

    /**
     * Function to generate the next chunk's Writable Stream
     */
    const getNewWriteStream = (index) => {
      return createWriteStream(resolve(process.cwd(), `chunk_${index}.txt`));
    };

    // 4. Listen to each line from the source file
    for await (const line of rl) {
      // If we don't have an active file or reached the limit, start a new one
      if (!currentWriteStream || currentLineCount >= linesPerChunk) {
        if (currentWriteStream) {
          currentWriteStream.end();
        }
        currentLineCount = 0;
        currentWriteStream = getNewWriteStream(chunkIndex++);
      }

      // Write the line followed by a newline character
      currentWriteStream.write(`${line}\n`);
      currentLineCount++;
    }

    // 5. Cleanup: Close the last stream if it exists
    if (currentWriteStream) {
      currentWriteStream.end();
      process.stdout.write(
        `File split successfully into ${chunkIndex - 1} chunks! \n`
      );
    }
  } catch (error) {
    // If source.txt is missing or any FS error occurs
    process.stderr.write("FS operation failed\n");
    process.exit(1);
  }
};

await split();
