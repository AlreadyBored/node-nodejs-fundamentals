import { createBrotliCompress } from "zlib";
import { pipeline } from "stream/promises";
import { createReadStream, createWriteStream } from "fs";
import path from "path";
import { createFolder, drillDownFolder, isFolderExists } from "../lib/utils.js";
import { Readable } from "stream";

const TARGET_FOLDER = "workspace/toCompress";
const OUTPUT_FOLDER = "workspace/compressed";

class ArchiveTargetsReader extends Readable {
  constructor(rootPath, targets) {
    super({ objectMode: true });
    this.targets = targets;
    this.rootPath = rootPath;
    this.index = 0;
    this.currentReadableStream = null; // One stream per file, so we can process them one by one
  }

  async _read() {
    if (this.currentReadableStream) {
      // If we have an active stream, we need to wait until it's done before we can read the next file
      return;
    }
    if (this.index >= this.targets.length) {
      this.push(null); // No more files to read
      return;
    }

    const relativeFilePath = this.targets[this.index++];
    const title = `---START---\nfile:${relativeFilePath}\n`;

    if (!this.push(title)) { // kind of separator of files content in archive
      // seems buffer is full, wait next try
      return;
    }

    this.currentReadableStream = createReadStream(path.join(this.rootPath, relativeFilePath));
    this.currentReadableStream.on("data", (chunk) => {      
      if (!this.push(chunk)) {
        this.currentReadableStream.pause();
      }
    });

    this.currentReadableStream.on("end", () => {
      this.push("\n---END---\n"); // Add a separator after each file content
      this.currentReadableStream = null;
      this._read(); // Continue reading the next file
    });

    this.currentReadableStream.on("error", (err) => this.destroy(err));

    this.on("drain", () => {
      this.currentReadableStream.resume();
    });
  }
}

const compressDir = async () => {
  // Write your code here
  // Read all files from workspace/toCompress/
  // Compress entire directory structure into archive.br
  // Save to workspace/compressed/
  // Use Streams API

  const folderExists = await isFolderExists(TARGET_FOLDER);
  if (!folderExists) {
    throw new Error("FS operation failed");
  }

  const rootPath = path.resolve(TARGET_FOLDER);
  const context = [];

  await drillDownFolder(rootPath, {
    runOnFile: async ({ pathTo, other }) => {
      other.push(path.relative(rootPath, pathTo));
    },
    other: context,
  });

  console.log(">>> files: ", context);

  const archiveTargetsReader = new ArchiveTargetsReader(
    rootPath,
    context,
  );
  const brotliCompress = createBrotliCompress();
  const outputFilePath = path.join(OUTPUT_FOLDER, "archive.br");
  if (!(await isFolderExists(OUTPUT_FOLDER))) {
    await createFolder(OUTPUT_FOLDER);
  }
  const outputWriteStream = createWriteStream(outputFilePath);

  await pipeline(archiveTargetsReader, brotliCompress, outputWriteStream);
};

await compressDir();
