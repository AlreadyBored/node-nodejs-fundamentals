import { createReadStream, createWriteStream } from "fs";
import { resolve } from "path";
import { Transform } from "stream";

const split = async () => {
  const args = process.argv;
  const linesArgIndex = args.indexOf("--lines");
  const maxLines =
    linesArgIndex !== -1 && args[linesArgIndex + 1]
      ? Number(args[linesArgIndex + 1])
      : 10;

  //source.txt should be in the root like node-nodejs-fundamentals/source.txt

  const sourceFile = resolve("source.txt");

  let leftover = "";
  let buffer = [];
  let chunkIndex = 1;

  const transformer = new Transform({
    transform(chunk, _, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split("\n");
      leftover = lines.pop();
      lines.forEach((line) => buffer.push(line));

      while (buffer.length >= maxLines) {
        const chunkLines = buffer.splice(0, maxLines);
        const chunkFile = resolve(`chunk_${chunkIndex++}.txt`);
        createWriteStream(chunkFile).write(chunkLines.join("\n") + "\n");
      }

      callback();
    },

    flush(callback) {
      if (leftover) buffer.push(leftover);

      if (buffer.length > 0) {
        const chunkFile = resolve(`chunk_${chunkIndex++}.txt`);
        createWriteStream(chunkFile).write(buffer.join("\n") + "\n");
      }

      callback();
    },
  });

  createReadStream(sourceFile).pipe(transformer);
};

await split();
