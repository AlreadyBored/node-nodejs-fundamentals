import { createWriteStream, createReadStream, existsSync } from "node:fs";
import { mkdir, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { cwd } from "node:process";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createBrotliCompress } from "node:zlib";

const compressDir = async () => {
  const workspaceDir = join(cwd(), "home/user/workspace");
  const toCompressDir = join(workspaceDir, "toCompress");
  const compressedDir = join(workspaceDir, "compressed");
  const archivePath = join(compressedDir, "archive.br");

  if (!existsSync(toCompressDir)) throw new Error("FS operation failed");

  await mkdir(compressedDir, { recursive: true });

  async function* getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });

    for (const dirent of dirents) {
      const filePath = join(dir, dirent.name);
      if (dirent.isDirectory()) {
        yield* getFiles(join(dir, dirent.name));
      } else {
        yield filePath;
      }
    }
  }

  const stream = Readable.from(
    (async function* streamGenerator() {
      for await (const filePath of getFiles(toCompressDir)) {
        const relativeFilePath = relative(toCompressDir, filePath);
        const fileStats = await stat(filePath);

        const relativeFilePathBuffer = Buffer.from(relativeFilePath, "utf-8");
        const header = Buffer.alloc(4 + relativeFilePathBuffer.length + 8);

        header.writeUInt32BE(relativeFilePathBuffer.length, 0);
        relativeFilePathBuffer.copy(header, 4);
        header.writeBigUInt64BE(
          BigInt(fileStats.size),
          4 + relativeFilePathBuffer.length,
        );

        yield header;

        for await (const chunk of createReadStream(filePath)) {
          yield chunk;
        }
      }
    })(),
  );

  await pipeline(
    stream,
    createBrotliCompress(),
    createWriteStream(archivePath, {}),
  );
};

await compressDir();
