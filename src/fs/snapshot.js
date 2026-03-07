import path from "path";
import fs from "fs/promises";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const snapshot = async () => {
  const workspacePath = path.join(__dirname, "workspace");
  const stats = await fs.stat(workspacePath);
  const rootPath = path.resolve(workspacePath);
  if (!stats.isDirectory()) {
    throw new Error("FS operation failed");
  }

  const entries = [];

  const scan = async (currentPath) => {
    try {
      let data = await fs.readdir(currentPath, { withFileTypes: true });
      for (const item of data) {
        const fullPath = path.join(currentPath, item.name);
        const relativePath = path.relative(rootPath, fullPath);

        if (item.isDirectory()) {
          console.log("DIR:", item.name);
          entries.push({
            path: relativePath,
            type: "directory",
          });
          console.log(entries);
          await scan(fullPath);
        }
        if (item.isFile()) {
          const buffer = await fs.readFile(fullPath);
          const size = buffer.length;
          const content = buffer.toString("base64");
          console.log("FILE:", item.name);
          entries.push({
            path: relativePath,
            type: "file",
            size,
            content,
          });
        }
      }
    } catch (err) {
      console.log(err);
    }

    // console.log(path.basename());
    //  const workspacePath = path.join(process.cwd(), "home");
    // Write your code here
    // Recursively scan workspace directory
    // Write snapshot.json with:
    // - rootPath: absolute path to workspace
    // - entries: flat array of relative paths and metadata
  };

  await scan(workspacePath);
  const result = {
    rootPath,
    entries,
  };
  console.log(result);
  const snapshotPath = path.join(path.dirname(workspacePath), "snapshot.json");

  await fs.writeFile(snapshotPath, JSON.stringify(result, null, 2));
};

await snapshot();
