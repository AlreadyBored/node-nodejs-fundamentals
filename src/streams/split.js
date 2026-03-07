import { createReadStream, createWriteStream } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const split = async () => {
  const args = process.argv.slice(2);
  const linesIndex = args.indexOf("--lines");
  const maxLines =
    linesIndex !== -1 && args[linesIndex + 1]
      ? Number(args[linesIndex + 1])
      : 10;

  const sourcePath = join(__dirname, "source.txt");

  return new Promise((resolve, reject) => {
    const readable = createReadStream(sourcePath, { encoding: "utf-8" });

    let chunkNumber = 1;
    let lineCount = 0;
    let currentWriter = null;
    let remainder = "";

    const createNewChunk = () => {
      if (currentWriter) {
        currentWriter.end();
      }
      const chunkPath = join(__dirname, `chunk_${chunkNumber}.txt`);
      currentWriter = createWriteStream(chunkPath);
      chunkNumber++;
      lineCount = 0;
    };

    createNewChunk();

    readable.on("data", (data) => {
      const text = remainder + data;
      const lines = text.split("\n");
      remainder = lines.pop();

      for (const line of lines) {
        if (lineCount >= maxLines) {
          createNewChunk();
        }
        currentWriter.write(line + "\n");
        lineCount++;
      }
    });

    readable.on("end", () => {
      if (remainder.length > 0) {
        if (lineCount >= maxLines) {
          createNewChunk();
        }
        currentWriter.write(remainder);
      }
      if (currentWriter) {
        currentWriter.end();
      }
      resolve();
    });

    readable.on("error", reject);
  });
};

await split();
