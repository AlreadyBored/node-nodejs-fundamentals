import fs from "fs/promises";
import path from "path";

const restore = async () => {
  try {
    const cwd = process.cwd();
    const snapshotPath = path.join(cwd, "snapshot.json");
    const restoredRoot = path.join(cwd, "workspace_restored");

    try {
      await fs.stat(restoredRoot);
      throw new Error();
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }

    const snapshotRaw = await fs.readFile(snapshotPath, "utf-8");
    const snapshot = JSON.parse(snapshotRaw);

    await fs.mkdir(restoredRoot);

    for (const entry of snapshot.entries) {
      const targetPath = path.join(restoredRoot, entry.path);

      if (entry.type === "directory") {
        await fs.mkdir(targetPath, { recursive: true });
      }

      if (entry.type === "file") {
        await fs.mkdir(path.dirname(targetPath), { recursive: true });

        const fileBuffer = Buffer.from(entry.content, "base64");

        await fs.writeFile(targetPath, fileBuffer);
      }
    }
  } catch {
    throw new Error("FS operation failed");
  }
};

await restore();
