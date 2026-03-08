import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import zlib from "zlib";
import readline from "readline";

const workspace = path.join(process.cwd(), "workspace");
const compressedDir = path.join(workspace, "compressed");
const archiveFile = path.join(compressedDir, "archive.br");
const outputDir = path.join(workspace, "decompressed");

const decompressDir = async () => {
  try {
    await fsPromises.access(compressedDir);
    await fsPromises.access(archiveFile);
  } catch {
    throw new Error("FS operation failed");
  }

  await fsPromises.mkdir(outputDir, { recursive: true });

  const brotli = zlib.createBrotliDecompress();
  const input = fs.createReadStream(archiveFile);

  let leftover = Buffer.alloc(0);

  input.pipe(brotli);

  brotli.on("data", async (chunk) => {
    leftover = Buffer.concat([leftover, chunk]);

    while (true) {
      const nameEnd = leftover.indexOf("\n");
      if (nameEnd === -1) break;
      const fileName = leftover.slice(0, nameEnd).toString("utf-8");
      leftover = leftover.slice(nameEnd + 1);

      const sizeEnd = leftover.indexOf("\n");
      if (sizeEnd === -1) {
        leftover = Buffer.concat([Buffer.from(fileName + "\n"), leftover]);
        break;
      }
      const sizeStr = leftover.slice(0, sizeEnd).toString("utf-8");
      const fileSize = Number(sizeStr);
      leftover = leftover.slice(sizeEnd + 1);

      if (leftover.length < fileSize) {
        leftover = Buffer.concat([
          Buffer.from(fileName + "\n" + sizeStr + "\n"),
          leftover,
        ]);
        break;
      }

      const fileContent = leftover.slice(0, fileSize);
      leftover = leftover.slice(fileSize);
      const fullPath = path.join(outputDir, fileName);
      await fsPromises.mkdir(path.dirname(fullPath), { recursive: true });
      await fsPromises.writeFile(fullPath, fileContent);
    }
  });

  brotli.on("end", () => {
    console.log(`Decompression done! Files extracted to ${outputDir}`);
  });

  brotli.on("error", (err) => {
    console.error("Decompression failed:", err);
  });
};

await decompressDir();
