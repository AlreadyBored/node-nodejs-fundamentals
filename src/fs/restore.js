import { mkdir, readFile, writeFile, access } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const directoryName = dirname(fileURLToPath(import.meta.url));

export const restore = async () => {
  const snapshotPath = join(directoryName, "snapshot.json");
  const restorePath = join(directoryName, "workspace_restored");

  await access(snapshotPath).catch(() => {
    throw new Error("FS operation failed");
  });

  await access(restorePath)
    .then(() => {
      throw new Error("FS operation failed");
    })
    .catch((err) => {
      if (err.message === "FS operation failed") {
        throw err;
      }
    });

  const raw = await readFile(snapshotPath, "utf-8");
  const snapshot = JSON.parse(raw);

  await mkdir(restorePath);

  for (const entry of snapshot.entries) {
    const fullPath = join(restorePath, entry.path);

    if (entry.type === "directory") {
      await mkdir(fullPath, { recursive: true });
    } else {
      const fileBytes = Buffer.from(entry.content, "base64");
      await writeFile(fullPath, fileBytes);
    }
  }
};

await restore();
