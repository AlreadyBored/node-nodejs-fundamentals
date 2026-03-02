import { promises as fs } from "fs";
import path from "path";

const snapshot = async () => {
  try {
    const workspacePath = path.resolve("workspace");
    const snapshotPath = path.resolve("snapshot.json");

    const stats = await fs.stat(workspacePath);
    if (!stats.isDirectory()) {
      throw new Error("Workspace path is not a directory");
    }

    const entries = [];

    const scanDir = async (currentPath) => {
      const items = await fs.readdir(currentPath, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(currentPath, item.name);
        const relativePath = path.relative(workspacePath, fullPath);

        if (item.isDirectory()) {
          entries.push({ path: relativePath, type: "directory" });
          await scanDir(fullPath);
        } else if (item.isFile()) {
          const fileBuffer = await fs.readFile(fullPath);
          const fileStats = await fs.stat(fullPath);
          entries.push({
            path: relativePath,
            type: "file",
            size: fileStats.size,
            content: fileBuffer.toString("utf-8"),
          });
        }
      }
    };

    await scanDir(workspacePath);

    const snapshotData = {
      rootPath: workspacePath,
      entries,
    };

    await fs.writeFile(
      snapshotPath,
      JSON.stringify(snapshotData, null, 2),
      "utf-8",
    );
  } catch (error) {
    throw new Error("Fs operation failed");
  }
};

await snapshot();
