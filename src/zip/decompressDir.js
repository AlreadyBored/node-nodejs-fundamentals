import { createBrotliDecompress } from "zlib";
import { createFolder, isFolderExists } from "../lib/utils.js";
import { pipeline } from "stream/promises";
import fs from "fs";
import path from "path";
import { Writable } from "stream";

const TARGET_FOLDER = "workspace/compressed";
const OUTPUT_FOLDER = "workspace/decompressed";

class ArchiveDecompressor extends Writable {
  constructor(outputFolder) {
    super();
    this.outputFolder = outputFolder;
    this.buffer = Buffer.alloc(0);
    this.state = "findStart";
    this.currentFilePath = null;
    this.currentWritableStream = null;

    this.START_MARKER = Buffer.from("---START---\n");
    this.END_MARKER = Buffer.from("\n---END---\n");
    this.FILE_PREFIX = "file:";
  }

  async _write(chunk, encoding, callback) {
    try {
      this.buffer = Buffer.concat([this.buffer, chunk]);
      await this._processBuffer();
      callback();
    } catch (err) {
      callback(err);
    }
  }

  async _final(callback) {
    try {
      await this._processBuffer(true);

      if (this.state !== "findStart" || this.buffer.length > 0) {
        throw new Error("Archive is corrupted");
      }

      callback();
    } catch (err) {
      callback(err);
    }
  }

  async _processBuffer(isFinal = false) {
    while (true) {
      // kind of state machine with 3 states: findStart, readHeader, readContent
      if (this.state === "findStart") {
        if (this.buffer.length < this.START_MARKER.length) {
          return;
        }

        const startIndex = this.buffer.indexOf(this.START_MARKER);

        if (startIndex === -1) {
          if (isFinal) {
            throw new Error("Archive is corrupted");
          }
          return;
        }

        if (startIndex > 0) {
          throw new Error("Archive is corrupted");
        }

        this.buffer = this.buffer.subarray(this.START_MARKER.length);
        this.state = "readHeader";
        continue;
      }

      if (this.state === "readHeader") {
        const lineEnd = this.buffer.indexOf("\n");

        if (lineEnd === -1) {
          if (isFinal) {
            throw new Error("Archive is corrupted");
          }
          return;
        }

        const headerLine = this.buffer.subarray(0, lineEnd).toString("utf-8");
        this.buffer = this.buffer.subarray(lineEnd + 1);

        if (!headerLine.startsWith(this.FILE_PREFIX)) {
          throw new Error("Archive is corrupted");
        }

        this.currentFilePath = headerLine.slice(this.FILE_PREFIX.length);

        if (!this.currentFilePath) {
          throw new Error("Archive is corrupted");
        }

        const outputFilePath = path.resolve(
          this.outputFolder,
          this.currentFilePath,
        );
        const parentDir = path.dirname(outputFilePath);

        await createFolder(parentDir);

        this.currentWritableStream = fs.createWriteStream(outputFilePath);
        this.state = "readContent";
        continue;
      }

      if (this.state === "readContent") {
        const endIndex = this.buffer.indexOf(this.END_MARKER);

        if (endIndex === -1) {
          const keepTailSize = this.END_MARKER.length - 1;

          if (this.buffer.length <= keepTailSize) {
            return;
          }

          const flushable = this.buffer.subarray(
            0,
            this.buffer.length - keepTailSize,
          );

          await this._writeToCurrentFile(flushable);

          this.buffer = this.buffer.subarray(this.buffer.length - keepTailSize);

          return;
        }

        const fileContentPart = this.buffer.subarray(0, endIndex);

        if (fileContentPart.length > 0) {
          await this._writeToCurrentFile(fileContentPart);
        }

        this._closeCurrentFile();

        this.buffer = this.buffer.subarray(endIndex + this.END_MARKER.length);
        this.currentFilePath = null;
        this.currentWritableStream = null;
        this.state = "findStart";
        continue;
      }
    }
  }

  async _writeToCurrentFile(chunk) {
    if (!this.currentWritableStream) {
      throw new Error("Archive is corrupted");
    }

    if (chunk.length === 0) {
      return;
    }
    // due to possibility of backpressure we need to wait until current chunk will be fully written to a file
    await new Promise((resolve, reject) => {
      const onError = (err) => {
        cleanup();
        reject(err);
      };
      const onDrain = () => {
        cleanup();
        resolve();
      };

      const cleanup = () => {
        this.currentWritableStream.off("error", onError);
        this.currentWritableStream.off("drain", onDrain);
      };

      this.currentWritableStream.on("error", onError);
      const canContinue = this.currentWritableStream.write(chunk);

      // if buffer is full, we need to wait for 'drain' event before writing more data
      if (canContinue) {
        cleanup();
        resolve();
        return;
      }
      // when buffer again will be available for writing, 'drain' event will be emitted and we will resolve the promise in onDrain handler
      this.currentWritableStream.on("drain", onDrain);
    });
  }

  _closeCurrentFile() {
    // just checking if we dont brake smth
    if (!this.currentWritableStream) {
      throw new Error("Archive is corrupted");
    }

    this.currentWritableStream.end();
  }
}

const decompressDir = async () => {
  // Write your code here
  // Read archive.br from workspace/compressed/
  // Decompress and extract to workspace/decompressed/
  // Use Streams API

  const folderExists = await isFolderExists(TARGET_FOLDER);
  if (!folderExists) {
    throw new Error("FS operation failed");
  }

  if (!(await isFolderExists(OUTPUT_FOLDER))) {
    await createFolder(OUTPUT_FOLDER);
  }

  const inputStream = fs.createReadStream(
    path.join(TARGET_FOLDER, "archive.br"),
  );
  const brotliDecompress = createBrotliDecompress();
  const extractor = new ArchiveDecompressor(OUTPUT_FOLDER);

  await pipeline(inputStream, brotliDecompress, extractor);
};

await decompressDir();
