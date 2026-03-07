import { readdir, readFile, writeFile, mkdir, access } from "node:fs/promises";
import { brotliCompressSync } from "node:zlib";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compressDir = async () => {
  const workspacePath = join(__dirname, "workspace");
  const toCompressPath = join(workspacePath, "toCompress");
  const compressedPath = join(workspacePath, "compressed");

  const exists = await access(toCompressPath)
    .then(() => true)
    .catch(() => false);
  if (!exists) throw new Error("FS operation failed");

  const entries = [];

  const walk = async (dir) => {
    const items = await readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(dir, item.name);
      const relPath = relative(toCompressPath, fullPath);

      if (item.isDirectory()) {
        entries.push({ path: relPath, type: "directory" });
        await walk(fullPath);
      } else {
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

  const compressed = brotliCompressSync(JSON.stringify({ entries }));
  await mkdir(compressedPath, { recursive: true });
  await writeFile(join(compressedPath, "archive.br"), compressed);
};

await compressDir();
