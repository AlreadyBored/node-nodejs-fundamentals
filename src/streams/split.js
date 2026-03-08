import { createReadStream, createWriteStream } from "fs";
import { Transform } from "stream";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const directoryName = dirname(fileURLToPath(import.meta.url));

const split = async () => {

  const linesIndex = process.argv.indexOf("--lines");
  const maxLines = linesIndex !== -1 ? Number(process.argv[linesIndex + 1]) : 10;

  const sourcePath = join(directoryName, "source.txt");

  let leftover = "";
  let lineBuffer = [];  
  let chunkNum = 1;


  const writeChunk = (lines) => {
    const outPath = join(directoryName, `chunk_${chunkNum}.txt`);
    const writer = createWriteStream(outPath);
    writer.write(lines.join("\n") + "\n");
    writer.end();
    chunkNum++;
  };

  await new Promise((resolve, reject) => {
    const reader = createReadStream(sourcePath);

    reader.on("data", (chunk) => {
      const text = leftover + chunk.toString();
      const lines = text.split("\n");
      leftover = lines.pop();

      for (const line of lines) {
        lineBuffer.push(line);

        if (lineBuffer.length === maxLines) {
          writeChunk(lineBuffer);
          lineBuffer = [];
        }
      }
    });

    reader.on("end", () => {

      if (leftover) lineBuffer.push(leftover);

      if (lineBuffer.length > 0) writeChunk(lineBuffer);
      resolve();
    });

    reader.on("error", reject);
  });
};

await split();