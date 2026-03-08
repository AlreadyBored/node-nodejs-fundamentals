import fs from "node:fs/promises";
import path from "node:path";

const restore = async () => {
  // Write your code here
  // Read snapshot.json
  // Treat snapshot.rootPath as metadata only
  // Recreate directory/file structure in workspace_restored
  try {
    const snapshotRaw = await fs.readFile("snapshot.json", "utf8");
    const snapshot = JSON.parse(snapshotRaw);

    const destDir = path.join(process.cwd(), "workspace_restored");

    try {
      await fs.access(destDir);
      throw new Error();
    } catch {}

    for (const entry of snapshot.entries) {
      const entryPath = path.join(destDir, entry.path);

      if (entry.type === "directory") {
        await fs.mkdir(entryPath, { recursive: true });
      } else if (entry.type === "file") {
        await fs.mkdir(path.dirname(entryPath), { recursive: true });
        const contentBuffer = Buffer.from(entry.content, "base64");
        await fs.writeFile(entryPath, contentBuffer);
      }
    }

    console.log("workspace_restored created successfully");
  } catch (err) {
    console.error("FS operation failed");
    process.exit(1);
  }
};

await restore();
