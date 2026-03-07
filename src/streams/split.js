import { createReadStream, createWriteStream } from "node:fs";
import { createInterface } from "node:readline";
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
  const rl = createInterface({ input: createReadStream(sourcePath) });

  let chunkNumber = 1;
  let lineCount = 0;
  let writer = createWriteStream(join(__dirname, `chunk_${chunkNumber}.txt`));

  for await (const line of rl) {
    if (lineCount >= maxLines) {
      writer.end();
      chunkNumber++;
      lineCount = 0;
      writer = createWriteStream(join(__dirname, `chunk_${chunkNumber}.txt`));
    }
    writer.write(line + "\n");
    lineCount++;
  }

  writer.end();
};

await split();
