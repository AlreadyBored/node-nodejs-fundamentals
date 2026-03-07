import { createWriteStream } from "node:fs";
import { readdir, readFile, mkdir, access } from "node:fs/promises";
import { createBrotliCompress } from "node:zlib";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compressDir = async () => {
  const workspacePath = join(__dirname, "workspace");
  const toCompressPath = join(workspacePath, "toCompress");
  const compressedPath = join(workspacePath, "compressed");

  try {
    await access(toCompressPath);
  } catch {
    throw new Error("FS operation failed");
  }

  const entries = [];

  const walk = async (dir) => {
    const dirEntries = await readdir(dir, { withFileTypes: true });
    for (const entry of dirEntries) {
      const fullPath = join(dir, entry.name);
      const relPath = relative(toCompressPath, fullPath);

      if (entry.isDirectory()) {
        entries.push({ path: relPath, type: "directory" });
        await walk(fullPath);
      } else if (entry.isFile()) {
        const content = await readFile(fullPath);
        entries.push({
          path: relPath,
          type: "file",
          content: content.toString("base64"),
        });
      }
    }
  };

  await walk(toCompressPath);

  const manifest = JSON.stringify({ entries });

  await mkdir(compressedPath, { recursive: true });

  await pipeline(
    Readable.from([manifest]),
    createBrotliCompress(),
    createWriteStream(join(compressedPath, "archive.br")),
  );
};

await compressDir();
