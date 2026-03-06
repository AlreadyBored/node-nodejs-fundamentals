import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { parseArgs } from "node:util";

class Read100LinesStream extends Readable {
  constructor(options) {
    super(options);
    this.targetFileStream = createInterface({
      input: createReadStream(options.filePath),
      crlfDelay: Infinity,
    });
  }

  async _read() {
    for await (const line of this.targetFileStream) {
      // Push each line to the readable stream, adding a newline character back
      // They are removed by readline, so we need to add them back to maintain the original file structure
      this.push(line + "\n");
    }

    this.push(null);
  }
}

const createChunkWriter = (chunkNumber) => {
  const chunkPath = path.resolve(`chunk_${chunkNumber}.txt`);
  return createWriteStream(chunkPath);
};

const split = async () => {
  const { values } = parseArgs({
    options: {
      lines: { type: "string", default: "10" },
    },
  });

  const linesPerChunk = Number.parseInt(values.lines, 10);
  if (!Number.isInteger(linesPerChunk) || linesPerChunk <= 0) {
    throw new Error("Bad lines parameter");
  }

  const sourceStream = new Read100LinesStream({
    filePath: path.resolve("source.txt"),
  });

  let chunkNumber = 1;
  let lineAccumulator = [];
  let buffer = "";

  for await (const chunk of sourceStream) {
    buffer += chunk.toString().replace(/\r/g, "");

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      lineAccumulator.push(line);

      if (lineAccumulator.length === linesPerChunk) {
        const chunkWriter = createChunkWriter(chunkNumber);
        chunkWriter.write(lineAccumulator.join("\n") + "\n");
        chunkWriter.end();
        chunkNumber++;
        lineAccumulator = [];
      }
    }
    // if lines 3 in target file, but per file 2 line, 1 left in lineAccumulator. 
    if (lineAccumulator.length > 0) {
      const chunkWriter = createChunkWriter(chunkNumber);
      chunkWriter.write(lineAccumulator.join("\n") + "\n");
      chunkWriter.end();
    }
  }
};

await split();
