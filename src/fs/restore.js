import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { resolve } from "path";

async function createEntries(entries, baseDir) {
  for (const entry of entries) {
    const targetPath = path.join(baseDir, entry.path);

    if (entry.type === "directory") {
      await mkdir(targetPath, { recursive: true });
    } else if (entry.type === "file") {
      const buffer = Buffer.from(entry.content, "base64");
      try {
        await mkdir(path.dirname(targetPath), { recursive: true });
        await writeFile(targetPath, buffer);
      } catch {
        throw new Error("FS operation failed");
      }
    }
  }
}

async function restore() {
  const snapshotPath = resolve("snapshot.json");
  const restoreDir = resolve("workspace_restored");

  try {
    await access(snapshotPath);
  } catch {
    throw new Error("FS operation failed");
  }

  try {
    const raw = await readFile(snapshotPath, "utf8");
    const snapshotData = JSON.parse(raw);
    await mkdir(restoreDir);
    await createEntries(snapshotData.entries, restoreDir);
    console.log("Operation done. Workspace folder is successfully restored");
  } catch {
    throw new Error("FS operation failed");
  }
}

await restore();
