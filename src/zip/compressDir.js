import { createWriteStream } from "fs";
import { mkdir, access, readdir, readFile } from "node:fs/promises";

import { resolve, join, relative } from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import { createBrotliCompress } from "zlib";

const pipe = promisify(pipeline);
export const LENGTH_FIELD_SIZE = 4; //bytes

const getFiles = async (dir) => {
  let files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await getFiles(fullPath);
      files = files.concat(subFiles);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
};

const compressDir = async () => {
  //workspace should be in the root like node-nodejs-fundamentals/workspace and contain toCompress folder inside

  const workspaceDir = resolve("workspace");

  const srcDir = join(workspaceDir, "toCompress");
  const destDir = join(workspaceDir, "compressed");
  const archiveFile = join(destDir, "archive.br");

  try {
    await access(srcDir);

    await mkdir(destDir, { recursive: true });

    const files = await getFiles(srcDir);

    const brotliStream = createBrotliCompress();
    const writeStream = createWriteStream(archiveFile);

    for (const filePath of files) {
      const relPath = relative(srcDir, filePath);
      const fileBuffer = await readFile(filePath);
      const pathBuffer = Buffer.from(relPath, "utf-8");

      const pathLengthBuffer = Buffer.alloc(LENGTH_FIELD_SIZE);
      pathLengthBuffer.writeUInt32BE(pathBuffer.length);

      const contentLengthBuffer = Buffer.alloc(LENGTH_FIELD_SIZE);
      contentLengthBuffer.writeUInt32BE(fileBuffer.length);

      brotliStream.write(pathLengthBuffer);
      brotliStream.write(pathBuffer);
      brotliStream.write(contentLengthBuffer);
      brotliStream.write(fileBuffer);
    }

    brotliStream.end();

    await pipe(brotliStream, writeStream);
  } catch {
    throw new Error("FS operation failed");
  }
};

await compressDir();
