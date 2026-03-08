import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const split = async () => {
  const args = process.argv.slice(2);
  const linesIdx = args.lastIndexOf("--lines");
  const linesPerChunk =
    linesIdx !== -1 && args[linesIdx + 1] ? Number(args[linesIdx + 1]) : 10;

  const sourcePath = path.join(__dirname, "..", "..", "source.txt");

  let leftover = "";
  let chunkIndex = 1;
  let currentLineCount = 0;
  let currentWriter = createWriteStream(
    path.join(__dirname, "..", "..", `chunk_${chunkIndex}.txt`),
  );

  const splitTransform = new Transform({
    transform(chunk, encoding, callback) {
      const text = leftover + chunk.toString();
      const lines = text.split("\n");
      leftover = lines.pop();

      for (const line of lines) {
        if (currentLineCount >= linesPerChunk) {
          chunkIndex++;
          currentWriter = createWriteStream(
            path.join(__dirname, "..", "..", `chunk_${chunkIndex}.txt`),
          );
          currentLineCount = 0;
        }
        currentWriter.write(line + "\n");
        currentLineCount++;
      }

      callback();
    },

    flush(callback) {
      if (leftover) {
        if (currentLineCount >= linesPerChunk) {
          chunkIndex++;
          currentWriter = createWriteStream(
            path.join(__dirname, "..", ".."`chunk_${chunkIndex}.txt`),
          );
        }
        currentWriter.write(leftover + "\n");
      }
      callback();
    },
  });

  const readStream = createReadStream(sourcePath);
  await pipeline(readStream, splitTransform);
};

split();
