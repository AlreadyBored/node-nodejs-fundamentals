import { promises as fs } from "fs";
import path from "path";

const findByExt = async () => {
  const extArgIndex = process.argv.indexOf("--ext");
  const extension = extArgIndex !== -1 ? process.argv[extArgIndex + 1] : ".txt";
  const workspacePath = path.resolve("workspace");

  try {
    const stats = await fs.stat(workspacePath);
    if (!stats.isDirectory()) {
      throw new Error("Workspace path is not a directory");
    } else {
      const result = [];

      const scanDir = async (currentPath) => {
        const items = await fs.readdir(currentPath, { withFileTypes: true });

        for (const item of items) {
          const fullPath = path.join(currentPath, item.name);
          if (item.isDirectory()) {
            await scanDir(fullPath);
          } else if (item.isFile() && path.extname(item.name) === extension) {
            result.push(path.relative(workspacePath, fullPath));
          }
        }
      };

      await scanDir(workspacePath);

      result.sort().forEach((file) => console.log(file));
    }
  } catch (error) {
    throw new Error("FS operation failed");
  }
};

await findByExt();
