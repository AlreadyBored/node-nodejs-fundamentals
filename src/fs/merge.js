import fs from "fs/promises";
import path from "path";

const merge = async () => {
  try {
    const cwd = process.cwd();
    const workspacePath = path.join(cwd, "workspace");
    const partsPath = path.join(workspacePath, "parts");
    const mergedPath = path.join(workspacePath, "merged.txt");

    const partsStats = await fs.stat(partsPath);
    if (!partsStats.isDirectory()) {
      throw new Error();
    }

    const args = process.argv.slice(2);
    const filesIndex = args.indexOf("--files");

    let filesToMerge = [];

    if (filesIndex !== -1 && args[filesIndex + 1]) {
      filesToMerge = args[filesIndex + 1].split(",");
      for (const fileName of filesToMerge) {
        const filePath = path.join(partsPath, fileName);

        try {
          const stat = await fs.stat(filePath);
          if (!stat.isFile()) throw new Error();
        } catch {
          throw new Error("FS operation failed");
        }
      }

    } else {
      const allFiles = await fs.readdir(partsPath);

      filesToMerge = allFiles
        .filter(file => path.extname(file) === ".txt")
        .sort();

      if (filesToMerge.length === 0) {
        throw new Error("FS operation failed");
      }
    }

    let mergedContent = "";

    for (const fileName of filesToMerge) {
      const filePath = path.join(partsPath, fileName);
      const content = await fs.readFile(filePath, "utf-8");
      mergedContent += content;
    }
    await fs.writeFile(mergedPath, mergedContent, "utf-8");

  } catch {
    throw new Error("FS operation failed");
  }
};

await merge();
