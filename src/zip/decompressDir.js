import { createReadStream } from "fs";
import { access, mkdir, writeFile } from "fs/promises";
import { resolve, join } from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import { createBrotliDecompress } from "zlib";
import { LENGTH_FIELD_SIZE } from "./compressDir.js";

const pipe = promisify(pipeline);

const decompressDir = async () => {
  const workspaceDir = resolve("workspace");
  const compressedDir = join(workspaceDir, "compressed");
  const archiveFile = join(compressedDir, "archive.br");
  const decompressedDir = join(workspaceDir, "decompressed");

  try {
    await access(compressedDir);
    await access(archiveFile);
    await mkdir(decompressedDir, { recursive: true });

    let leftover = Buffer.alloc(0);

    const readStream = createReadStream(archiveFile);
    const brotliStream = createBrotliDecompress();

    brotliStream.on("data", async (chunk) => {
      leftover = Buffer.concat([leftover, chunk]);

      while (true) {
        if (leftover.length < LENGTH_FIELD_SIZE) break;

        const pathLength = leftover.readUInt32BE(0);

        const headerLength = LENGTH_FIELD_SIZE + pathLength + LENGTH_FIELD_SIZE;
        if (leftover.length < headerLength) break;

        const pathStart = LENGTH_FIELD_SIZE;
        const pathEnd = pathStart + pathLength;
        const pathBuffer = leftover.subarray(pathStart, pathEnd);
        const relativeFilePath = pathBuffer.toString("utf-8");

        const contentLengthOffset = LENGTH_FIELD_SIZE + pathLength;
        const contentLength = leftover.readUInt32BE(contentLengthOffset);

        const totalLengthNeeded = headerLength + contentLength;
        if (leftover.length < totalLengthNeeded) break;

        const contentStart = contentLengthOffset + LENGTH_FIELD_SIZE;
        const contentEnd = contentStart + contentLength;
        const contentBuffer = leftover.subarray(contentStart, contentEnd);
        const fullPath = join(decompressedDir, relativeFilePath);
        await mkdir(resolve(fullPath, ".."), { recursive: true });
        await writeFile(fullPath, contentBuffer);

        leftover = leftover.subarray(totalLengthNeeded);
      }
    });

    await pipe(readStream, brotliStream);
  } catch {
    throw new Error("FS operation failed");
  }
};

await decompressDir();
