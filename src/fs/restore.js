import fs from "node:fs/promises";
import path from "node:path";

const restore = async () => {
  const snapshotFilePath = path.join(process.cwd(), "snapshot.json");
  const restoredAbsPath = path.join(process.cwd(), "workspace_restored");

  try {
    await fs.stat(snapshotFilePath);
  } catch {
    throw new Error("FS operation failed");
  }

  try {
    await fs.stat(restoredAbsPath);
    throw new Error("FS operation failed");
  } catch {
    /* not exists -> ok */
  }

  try {
    await fs.mkdir(restoredAbsPath);
  } catch {
    throw new Error("FS operation failed");
  }

  let snapshotText;

  try {
    snapshotText = await fs.readFile(snapshotFilePath, "utf8");
  } catch {
    throw new Error("FS operation failed");
  }

  let snapshotData;

  try {
    snapshotData = JSON.parse(snapshotText);
  } catch {
    throw new Error("FS operation failed");
  }

  const { entries } = snapshotData;

  if (!Array.isArray(entries)) {
    throw new Error("FS operation failed");
  }

  try {
    for (const entry of entries) {
      if (entry.type === "directory") {
        const targetDirAbsPath = path.join(restoredAbsPath, entry.path);
        await fs.mkdir(targetDirAbsPath, { recursive: true });
      } else if (entry.type === "file") {
        const targetFileAbsPath = path.join(restoredAbsPath, entry.path);
        const parentDirAbsPath = path.dirname(targetFileAbsPath);
        await fs.mkdir(parentDirAbsPath, { recursive: true });

        if (typeof entry.content !== "string") {
          throw new Error("FS operation failed");
        }
        await fs.writeFile(targetFileAbsPath, entry.content, "base64");
      } else {
        throw new Error("FS operation failed");
      }
    }
  } catch {
    throw new Error("FS operation failed");
  }
};

await restore();
