import { readdir, readFile, writeFile, access } from "node:fs/promises";
import { join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const snapshot = async () => {
  const workspacePath = join(__dirname, "workspace");

  try {
    await access(workspacePath);
  } catch {
    throw new Error("FS operation failed");
  }

  const entries = [];

  const walk = async (currentDir) => {
    const dirEntries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of dirEntries) {
      const fullPath = join(currentDir, entry.name);
      const relPath = relative(workspacePath, fullPath);

      if (entry.isDirectory()) {
        entries.push({ path: relPath, type: "directory" });
        await walk(fullPath);
      } else if (entry.isFile()) {
        const content = await readFile(fullPath);
        entries.push({
          path: relPath,
          type: "file",
          size: content.length,
          content: content.toString("base64")
        });
      }
    }
  };

  await walk(workspacePath);

  const snapshotData = {
    rootPath: resolve(workspacePath),
    entries
  };

  const snapshotPath = join(__dirname, "snapshot.json");
  await writeFile(snapshotPath, JSON.stringify(snapshotData, null, 2), "utf-8");
};

await snapshot();
