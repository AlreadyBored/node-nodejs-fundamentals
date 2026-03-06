import fs from "fs/promises";
import path from "path";

const snapshot = async () => {
  // Write your code here
  // Recursively scan workspace directory
  // Write snapshot.json with:
  // - rootPath: absolute path to workspace
  // - entries: flat array of relative paths and metadata
  const rootPath = process.cwd();
  const outputFile = path.join(rootPath, "snapshot.json");
  const entries = [];

  const scan = async (currentPath) => {
    const items = await fs.readdir(currentPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);
      const relativePath = path.relative(rootPath, fullPath);

      if (relativePath === "snapshot.json") {
        continue;
      }

      const stats = await fs.stat(fullPath);

      if (item.isFile()) {
        const content = await fs.readFile(fullPath);
        entries.push({
          path: relativePath,
          type: "file",
          size: stats.size,
          content: content.toString("base64"),
        });
      } else if (item.isDirectory()) {
        entries.push({
          path: relativePath,
          type: "directory",
        });
        await scan(fullPath);
      }
    }
  };

  await scan(rootPath);

  const data = {
    rootPath,
    entries,
  };

  await fs.writeFile(outputFile, JSON.stringify(data, null, 2), "utf-8");
};

await snapshot();
