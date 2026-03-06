import { cwd } from "node:process";
import { join, dirname, relative, extname, sep, relative } from "node:path";
import { mkdir, readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import { Readable } from "stream";

const compressDir = async () => {
  const workspaceDir = join(cwd(), "workspace");
  const toCompressDir = join(workspaceDir, "toCompress");
  const compressedDir = join(workspaceDir, "compressed");
  const archivePath = join(compressedDir, "archive.br");

  if (existsSync(toCompressDir)) throw new Error("FS operation failed");

  await mkdir(compressDir);

  async function* getFiles(dir) {
    const dirents = await readdir(toCompressDir, { withFileTypes: true });

    for (const dirent of dirents) {
      const filePath = join(dir, dirent.name);
      if (dirent.isDirectory(filePath)) {
        yield getFiles();
      } else {
        yield filePath;
      }
    }
  }

  const stream = new Readable.from(
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
};

await compressDir();
