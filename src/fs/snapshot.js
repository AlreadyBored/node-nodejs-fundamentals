import fs from "fs/promises";
import path from "path";

const snapshot = async () => {
  try {
    const workspacePath = path.join(process.cwd(), "workspace");

    const workspaceStats = await fs.stat(workspacePath);
    if (!workspaceStats.isDirectory()) {
      throw new Error();
    }

    const entries = [];

    const scanDir = async (currentPath) => {
      const items = await fs.readdir(currentPath, { withFileTypes: true });

      for (const item of items) {
        const absolutePath = path.join(currentPath, item.name);
        const relativePath = path.relative(workspacePath, absolutePath);

        if (item.isDirectory()) {
          entries.push({
            path: relativePath,
            type: "directory",
          });

          await scanDir(absolutePath);
        } else if (item.isFile()) {
          const fileBuffer = await fs.readFile(absolutePath);
          const stats = await fs.stat(absolutePath);

          entries.push({
            path: relativePath,
            type: "file",
            size: stats.size,
            content: fileBuffer.toString("base64"),
          });
        }
      }
    };

    await scanDir(workspacePath);

    const snapshotData = {
      rootPath: workspacePath,
      entries,
    };

    const snapshotPath = path.join(process.cwd(), "snapshot.json");

    await fs.writeFile(
      snapshotPath,
      JSON.stringify(snapshotData, null, 2),
      "utf-8"
    );

  } catch (err) {
    throw new Error("FS operation failed");
  }
};

await snapshot();
