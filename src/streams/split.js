import fs from "node:fs";
import path from "node:path";

const split = async () => {
  // Write your code here
  // Read source.txt using Readable Stream
  // Split into chunk_1.txt, chunk_2.txt, etc.
  // Each chunk max N lines (--lines CLI argument, default: 10)

  const linesArg = process.argv.find((arg) => arg.startsWith("--lines="));
  const maxLines = linesArg ? parseInt(linesArg.split("=")[1]) : 10;

  const inputFile = "source.txt";
  const stream = fs.createReadStream(inputFile, { encoding: "utf8" });

  let buffer = "";
  let lineCount = 0;
  let chunkIndex = 1;
  let lines = [];

  stream.on("data", (chunk) => {
    buffer += chunk;
    const parts = buffer.split("\n");
    buffer = parts.pop();

    for (const line of parts) {
      lines.push(line);
      lineCount++;
      if (lineCount === maxLines) {
        fs.writeFileSync(`chunk_${chunkIndex}.txt`, lines.join("\n"));
        chunkIndex++;
        lines = [];
        lineCount = 0;
      }
    }
  });

  stream.on("end", () => {
    if (lines.length > 0) {
      fs.writeFileSync(`chunk_${chunkIndex}.txt`, lines.join("\n"));
    }
  });
};

await split();
