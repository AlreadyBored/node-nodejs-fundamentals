import { createReadStream, createWriteStream } from "fs";
import { createInterface } from "readline";
import path from "path";

const split = async () => {
  const linesIndex = process.argv.indexOf("--lines");
  const maxLines = linesIndex !== -1 ? parseInt(process.argv[linesIndex + 1], 10) : 10;

  const sourcePath = path.resolve("./src/streams/source.txt");
  let chunkIndex = 1;
  let currentLineCount = 0;
  let writeStream = null;

  const rl = createInterface({
    input: createReadStream(sourcePath),
    crlfDelay: Infinity, 
  });

  try {
    for await (const line of rl) {
      if (!writeStream || currentLineCount >= maxLines) {
        if (writeStream) writeStream.end();
        
        writeStream = createWriteStream(
          path.resolve(`./src/streams/chunk_${chunkIndex}.txt`)
        );
        chunkIndex++;
        currentLineCount = 0;
      }

      writeStream.write(`${line}\n`);
      currentLineCount++;
    }
  } finally {
    if (writeStream) writeStream.end();
  }
};

await split();