import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const snapshotPath = path.resolve(__dirname, "snapshot.json");
const restoreDir = path.resolve(__dirname, "workspace_restored");

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
  try {
    await access(snapshotPath);
  } catch {
    throw new Error("FS operation failed");
  }

  let snapshotData;
  try {
    const raw = await readFile(snapshotPath, "utf8");
    snapshotData = JSON.parse(raw);
  } catch {
    throw new Error("FS operation failed");
  }

  try {
    await mkdir(restoreDir);
  } catch {
    throw new Error("FS operation failed");
  }

  await createEntries(snapshotData.entries, restoreDir);
  console.log("Operation done. Workspace folder is successfully restored");
}

await restore();
