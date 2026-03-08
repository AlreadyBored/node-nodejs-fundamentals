import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { resolve, join, dirname } from "node:path";

// Write your code here
// Read snapshot.json
// Treat snapshot.rootPath as metadata only
// Recreate directory/file structure in workspace_restored

const restore = async () => {
  const snapshotPath = resolve(process.cwd(), "snapshot.json");
  const restorePath = resolve(process.cwd(), "workspace_restored");

  try {
    // Validate snapshot exists
    try {
      await stat(snapshotPath);
    } catch {
      throw new Error("FS operation failed");
    }

    // Ensure destination does not exist
    try {
      await stat(restorePath);
      throw new Error("FS operation failed");
    } catch (error) {
      if (error.message === "FS operation failed") throw error;
    }

    const rawData = await readFile(snapshotPath, "utf-8");
    const { entries } = JSON.parse(rawData);

    await mkdir(restorePath);

    for (const entry of entries) {
      const entryPath = join(restorePath, entry.path);

      if (entry.type === "directory") {
        await mkdir(entryPath, { recursive: true });
      } else {
        await mkdir(dirname(entryPath), { recursive: true });
        const fileBuffer = Buffer.from(entry.content, "base64");
        await writeFile(entryPath, fileBuffer);
      }
    }
  } catch (error) {
    throw new Error("FS operation failed");
  }
};

await restore();
