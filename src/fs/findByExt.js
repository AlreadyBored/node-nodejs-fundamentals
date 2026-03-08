import { readdir, stat } from "node:fs/promises";
import { resolve, join, relative, extname } from "node:path";

// Write your code here
// Recursively find all files with specific extension
// Parse --ext CLI argument (default: .txt)

const findByExt = async () => {
  try {
    const workspacePath = resolve(process.cwd(), "workspace");

    // Pre-validation: Ensure the workspace directory exists
    try {
      await stat(workspacePath);
    } catch {
      throw new Error("FS operation failed");
    }

    const args = process.argv;
    const extIndex = args.indexOf("--ext");
    let targetExt = ".txt";

    if (extIndex !== -1 && args[extIndex + 1]) {
      const providedValue = args[extIndex + 1];
      targetExt = providedValue.startsWith(".")
        ? providedValue
        : `.${providedValue}`;
    }

    const results = [];

    const scan = async (currentPath) => {
      const folderContents = await readdir(currentPath);
      for (const item of folderContents) {
        const fullPath = join(currentPath, item);
        const itemStat = await stat(fullPath);

        if (itemStat.isFile()) {
          if (extname(fullPath) === targetExt) {
            results.push(relative(workspacePath, fullPath));
          }
        } else if (itemStat.isDirectory()) {
          await scan(fullPath);
        }
      }
    };

    await scan(workspacePath);
    results.sort();
    results.forEach((filePath) => process.stdout.write(`${filePath}\n`));
  } catch (error) {
    throw new Error("FS operation failed");
  }
};

await findByExt();
