import fs from "node:fs/promises";
import path from "node:path";

const scanDir = async (dir, baseDir) => {
  const entries = [];
  const items = await fs.readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (item.isDirectory()) {
      entries.push({ path: relativePath, type: "directory" });
      const subEntries = await scanDir(fullPath, baseDir);
      entries.push(...subEntries);
    } else if (item.isFile()) {
      const contentBuffer = await fs.readFile(fullPath);
      entries.push({
        path: relativePath,
        type: "file",
        size: contentBuffer.length,
        content: contentBuffer.toString("base64"),
      });
    }
  }

  return entries;
};

const snapshot = async () => {
  // Write your code here
  // Recursively scan workspace directory
  // Write snapshot.json with:
  // - rootPath: absolute path to workspace
  // - entries: flat array of relative paths and metadata

  const workspaceDir = path.join(process.cwd(), "workspace");

  try {
    await fs.access(workspaceDir);
    const entries = await scanDir(workspaceDir, workspaceDir);

    const snapshotData = { rootPath: workspaceDir, entries };
    await fs.writeFile("snapshot.json", JSON.stringify(snapshotData, null, 2));

    console.log("snapshot.json created successfully");
  } catch (err) {
    console.error("FS operation failed");
    process.exit(1);
  }
};

await snapshot();
