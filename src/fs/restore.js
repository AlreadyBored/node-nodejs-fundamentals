import fs from "fs/promises";
import path from "path";

const restore = async () => {
  const restoredFolder = "./workspace_restored";
  const snapshotFile = "./snapshot.json";
  try {
    const snapshotStat = await fs.stat(snapshotFile);
    if (!snapshotStat.isFile()) {
      throw new Error(`FS operation failed`);
    }
  } catch {
    throw new Error(`FS operation failed`);
  }
  try {
    const stat = await fs.stat(restoredFolder);
    if (stat.isDirectory()) {
      throw new Error(`FS operation failed`);
    }
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
  fs.mkdir(restoredFolder, { recursive: true });
  const fileContent = await fs.readFile(snapshotFile, "utf-8");
  const pathObj = JSON.parse(fileContent);
  for (const entry of pathObj.entries) {
    if (entry.type === "file") {
      await fs.mkdir(path.join(restoredFolder, path.dirname(entry.path)), {
        recursive: true,
      });
      fs.writeFile(
        path.join(restoredFolder, entry.path),
        entry.content,
        "base64",
      );
    } else {
      fs.mkdir(path.join(restoredFolder, entry.path), { recursive: true });
    }
  }
  console.log(`${restoredFolder} folder successfully created!`);
};

await restore();
