import fs from "fs/promises";
import path from "path";

const findByExt = async () => {
  try {
    const cwd = process.cwd();
    const workspacePath = path.join(cwd, "workspace");

    const stats = await fs.stat(workspacePath);
    if (!stats.isDirectory()) {
      throw new Error();
    }

    const args = process.argv.slice(2);
    const extIndex = args.indexOf("--ext");

    let extension = ".txt";

    if (extIndex !== -1 && args[extIndex + 1]) {
      extension = args[extIndex + 1].startsWith(".")
        ? args[extIndex + 1]
        : `.${args[extIndex + 1]}`;
    }

    const result = [];

    const scanDir = async (currentPath) => {
      const items = await fs.readdir(currentPath, { withFileTypes: true });

      for (const item of items) {
        const absolutePath = path.join(currentPath, item.name);
        const relativePath = path.relative(workspacePath, absolutePath);

        if (item.isDirectory()) {
          await scanDir(absolutePath);
        }

        if (item.isFile() && path.extname(item.name) === extension) {
          result.push(relativePath);
        }
      }
    };

    await scanDir(workspacePath);

    result.sort();

    for (const filePath of result) {
      console.log(filePath);
    }

  } catch {
    throw new Error("FS operation failed");
  }
};

await findByExt();
