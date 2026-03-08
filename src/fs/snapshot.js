import { readdir, stat, writeFile, readFile } from "node:fs/promises";
import { resolve, join, relative } from "node:path";

// Write your code here
// Recursively scan workspace directory
// Write snapshot.json with:
// - rootPath: absolute path to workspace
// - entries: flat array of relative paths and metadata

const snapshot = async () => {
  try {
    const workspacePath = resolve(process.cwd(), "workspace");
    const entries = [];

    try {
      await stat(workspacePath);
    } catch {
      throw new Error("FS operation failed");
    }

    const scan = async (currentDir) => {
      const names = await readdir(currentDir);

      for (const name of names) {
        const fullPath = join(currentDir, name);
        const fileStat = await stat(fullPath);
        const relativePath = relative(workspacePath, fullPath);

        if (fileStat.isFile()) {
          const content = await readFile(fullPath);
          entries.push({
            path: relativePath,
            type: "file",
            size: fileStat.size,
            content: content.toString("base64"),
          });
        } else if (fileStat.isDirectory()) {
          entries.push({
            path: relativePath,
            type: "directory",
          });
          await scan(fullPath);
        }
      }
    };

    await scan(workspacePath);

    const finalResult = {
      rootPath: workspacePath,
      entries: entries,
    };

    await writeFile("snapshot.json", JSON.stringify(finalResult, null, 2));

    process.stdout.write(`the rootPath is: ${workspacePath}\n`);
    process.stdout.write("Snapshot created successfully!\n");
  } catch (error) {
    throw new Error("FS operation failed");
  }
};

await snapshot();
