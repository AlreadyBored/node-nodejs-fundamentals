import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { brotliDecompressSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const decompressDir = async () => {
  const workspacePath = join(__dirname, "workspace");
  const archivePath = join(workspacePath, "compressed", "archive.br");
  const decompressedPath = join(workspacePath, "decompressed");

  const exists = await access(archivePath)
    .then(() => true)
    .catch(() => false);
  if (!exists) throw new Error("FS operation failed");

  const compressed = await readFile(archivePath);
  const json = brotliDecompressSync(compressed).toString("utf-8");
  const manifest = JSON.parse(json);

  await mkdir(decompressedPath, { recursive: true });

  for (const entry of manifest.entries) {
    const targetPath = join(decompressedPath, entry.path);

    if (entry.type === "directory") {
      await mkdir(targetPath, { recursive: true });
    } else {
      await mkdir(dirname(targetPath), { recursive: true });
      await writeFile(targetPath, Buffer.from(entry.content, "base64"));
    }
  }
};

await decompressDir();
