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

  let restoredExists = false;

  try {
    await fs.stat(restoredAbsPath);
    restoredExists = true;
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw new Error("FS operation failed");
    }
  }

  if (restoredExists) {
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
    await fs.mkdir(restoredAbsPath);

    for (const entry of entries) {
      const targetPath = path.join(restoredAbsPath, entry.path);

      if (entry.type === "directory") {
        await fs.mkdir(targetPath, { recursive: true });
      } else if (entry.type === "file") {
        if (typeof entry.content !== "string") {
          throw new Error();
        }

        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, entry.content, "base64");
      } else {
        throw new Error();
      }
    }
  } catch {
    throw new Error("FS operation failed");
  }
};

await restore();