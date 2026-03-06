import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const restore = async () => {
  const snapshotPath = path.join(__dirname, "..", "..", "snapshot.json");
  const restorePath = path.join(__dirname, "..", "..", "workspace_restored");

  const snapshotExists = await fs
    .access(snapshotPath)
    .then(() => true)
    .catch(() => false);
  if (!snapshotExists) throw new Error("FS operation failed");

  const restoredExists = await fs
    .access(restorePath)
    .then(() => true)
    .catch(() => false);
  if (restoredExists) throw new Error("FS operation failed");

  const snapshotFile = await fs.readFile(snapshotPath, "utf8");
  const snapshotObject = JSON.parse(snapshotFile);

  await fs.mkdir(restorePath, { recursive: true });

  for (const entry of snapshotObject.entries) {
    if (entry.type === "directory") {
      const dirPath = path.join(restorePath, entry.path);
      await fs.mkdir(dirPath, { recursive: true });
    } else {
      const filePath = path.join(restorePath, entry.path);
      await fs.writeFile(filePath, entry.content, "base64");
    }
  }
};

await restore();
