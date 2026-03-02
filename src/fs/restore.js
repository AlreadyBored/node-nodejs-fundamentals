import { promises as fs } from "fs";
import path from "path";

const restore = async () => {
  const snapshotPath = path.resolve("snapshot.json");
  const restoredPath = path.resolve("workspace_restored");

  try {
    const snapshotData = await fs.readFile(snapshotPath, "utf-8");
    const { entries } = JSON.parse(snapshotData);

    for (const entry of entries) {
      const fullPath = path.join(restoredPath, entry.path);
      if (entry.type === "directory") {
        await fs.mkdir(fullPath, { recursive: true });
      } else if (entry.type === "file") {
        await fs.mkdir(path.dirname(fullPath), { recursive: true });

        const buffer = Buffer.from(entry.content, "utf-8");
        await fs.writeFile(fullPath, buffer);
      }
    }
  } catch (error) {
    throw new Error("FS operation failed");
  }
};

await restore();
