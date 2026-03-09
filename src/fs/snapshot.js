import fs from "fs";
import path from "path";

async function scanDirectory(dirPath, basePath, entries = []) {
  const items = await fs.promises.readdir(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = await fs.promises.stat(fullPath);
    const relativePath = path.relative(basePath, fullPath);

    if (stat.isDirectory()) {
      entries.push({ path: relativePath, type: "directory" });
      await scanDirectory(fullPath, basePath, entries);
    } else {
      const content = await fs.promises.readFile(fullPath);
      entries.push({
        path: relativePath,
        type: "file",
        size: stat.size,
        content: content.toString("base64"),
      });
    }
  }

  return entries;
}

const snapshot = async () => {
  const workspacePath = path.resolve("workspace");
  const entries = await scanDirectory(workspacePath, workspacePath);

  const data = { rootPath: workspacePath, entries };

  await fs.promises.writeFile(
    "snapshot.json",
    JSON.stringify(data, null, 2),
    "utf-8",
  );
};

await snapshot();
