import { Transform, pipeline } from "stream";
import fs from "fs";
import path from "path";
import readline from "readline";

const split = async () => {
  const linesPerChunk = Number(
    process.argv[process.argv.indexOf("--lines") + 1] || 10,
  );
  const inputFile = path.join(process.cwd(), "source.txt");

  let chunkNumber = 1;
  let buffer = [];

  const chunkStream = new Transform({
    writableObjectMode: true,
    readableObjectMode: true,
    async transform(line, _, callback) {
      buffer.push(line.toString());

      if (buffer.length >= linesPerChunk) {
        const chunkPath = path.join(process.cwd(), `chunk_${chunkNumber}.txt`);
        await fs.promises.writeFile(chunkPath, buffer.join("\n") + "\n");
        chunkNumber++;
        buffer = [];
      }

      callback();
    },
    async flush(callback) {
      if (buffer.length > 0) {
        const chunkPath = path.join(process.cwd(), `chunk_${chunkNumber}.txt`);
        await fs.promises.writeFile(chunkPath, buffer.join("\n") + "\n");
      }
      callback();
    },
  });

  const rl = readline.createInterface({
    input: fs.createReadStream(inputFile),
    crlfDelay: Infinity,
  });

  pipeline(rl, chunkStream, (err) => {
    if (err) console.error("Pipeline failed:", err);
    else console.log(`Split done! Created ${chunkNumber} chunk(s)`);
  });
};

await split();
