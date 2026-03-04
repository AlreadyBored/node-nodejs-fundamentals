import { readdir, stat, readFile } from "node:fs/promises";
import path from "node:path";

export async function scanDirectory(absDir, relativeDir = "") {
  let entries;
  try {
    entries = await readdir(absDir, { withFileTypes: true });
  } catch {
    throw new Error("FS operation failed");
  }

  const contentEntries = [];

  for (const entry of entries) {
    const absPath = path.resolve(absDir, entry.name);
    const relativePath = relativeDir
      ? path.join(relativeDir, entry.name)
      : entry.name;

    if (entry.isDirectory()) {
      contentEntries.push({
        path: relativePath,
        type: "directory",
      });

      const nested = await scanDirectory(absPath, relativePath);
      contentEntries.push(...nested);
    } else if (entry.isFile()) {
      const fileStat = await stat(absPath);
      const buffer = await readFile(absPath);

      contentEntries.push({
        path: relativePath,
        type: "file",
        size: fileStat.size,
        content: buffer.toString("base64"),
      });
    }
  }
  return contentEntries;
}
