import { createReadStream } from "node:fs";
import { writeFile, mkdir, access } from "node:fs/promises";
import { createBrotliDecompress } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { Writable } from "node:stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const decompressDir = async () => {
  const workspacePath = join(__dirname, "workspace");
  const compressedPath = join(workspacePath, "compressed");
  const archivePath = join(compressedPath, "archive.br");
  const decompressedPath = join(workspacePath, "decompressed");

  try {
    await access(compressedPath);
    await access(archivePath);
  } catch {
    throw new Error("FS operation failed");
  }

  const chunks = [];
  const collectStream = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });

  await pipeline(
    createReadStream(archivePath),
    createBrotliDecompress(),
    collectStream,
  );

  const json = Buffer.concat(chunks).toString("utf-8");
  const manifest = JSON.parse(json);

  await mkdir(decompressedPath, { recursive: true });

  for (const entry of manifest.entries) {
    const targetPath = join(decompressedPath, entry.path);

    if (entry.type === "directory") {
      await mkdir(targetPath, { recursive: true });
    } else if (entry.type === "file") {
      await mkdir(dirname(targetPath), { recursive: true });
      const content = Buffer.from(entry.content, "base64");
      await writeFile(targetPath, content);
    }
  }
};

await decompressDir();
