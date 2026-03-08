import path from "node:path";
import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const compressDir = async () => {
  const toCompressPath = path.join(
    __dirname,
    "..",
    "..",
    "workspace",
    "toCompress",
  );
  const compressedPath = path.join(
    __dirname,
    "..",
    "..",
    "workspace",
    "compressed",
  );
  const archivePath = path.join(compressedPath, "archive.br");

  try {
    await fs.access(toCompressPath);
  } catch {
    throw new Error("FS operation failed");
  }

  await fs.mkdir(compressedPath, { recursive: true });

  const files = await fs.readdir(toCompressPath, { recursive: true });
  const entries = [];

  for (const file of files) {
    const absolutePath = path.join(toCompressPath, file);
    const stat = await fs.stat(absolutePath);
    if (stat.isFile()) {
      const content = await fs.readFile(absolutePath, "base64");
      entries.push({ path: file, content });
    }
  }

  const json = JSON.stringify(entries);

  await pipeline(
    Readable.from(json),
    zlib.createBrotliCompress(),
    createWriteStream(archivePath),
  );
};

await compressDir();
