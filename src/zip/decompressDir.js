import path from "node:path";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import zlib from "node:zlib";
import { Writable } from "node:stream";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const decompressDir = async () => {
  const compressedPath = path.join(
    __dirname,
    "..",
    "..",
    "workspace",
    "compressed",
  );
  const archivePath = path.join(compressedPath, "archive.br");
  const decompressedPath = path.join(
    __dirname,
    "..",
    "..",
    "workspace",
    "decompressed",
  );

  try {
    await fs.access(compressedPath);
  } catch {
    throw new Error("FS operation failed");
  }

  try {
    await fs.access(archivePath);
  } catch {
    throw new Error("FS operation failed");
  }

  await fs.mkdir(decompressedPath, { recursive: true });

  const chunks = [];
  const collector = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });

  await pipeline(
    createReadStream(archivePath),
    zlib.createBrotliDecompress(),
    collector,
  );

  const json = Buffer.concat(chunks).toString();
  const entries = JSON.parse(json);

  for (const entry of entries) {
    const filePath = path.join(decompressedPath, entry.path);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, entry.content, "base64");
  }
};

await decompressDir();
