import { promises as fs } from "fs";
import path from "path";

const merge = async () => {
  const partsPath = path.resolve("workspace", "parts");
  const mergedFilePath = path.resolve("workspace", "merged.txt");

  try {
    const argIndex = process.argv.indexOf("--files");
    let filesToMerge;

    if (argIndex !== -1) {
      const argValue = process.argv[argIndex + 1];

      if (!argValue) {
        throw new Error();
      }

      filesToMerge = argValue.split(",").map((f) => f.trim());
    }

    const allFiles = await fs.readdir(partsPath);

    let files;

    if (filesToMerge) {
      for (const file of filesToMerge) {
        if (!allFiles.includes(file)) {
          throw new Error();
        }
      }

      files = filesToMerge;
    } else {
      files = allFiles.filter((file) => path.extname(file) === ".txt").sort();

      if (files.length === 0) {
        throw new Error();
      }
    }

    let mergedContent = "";

    for (const file of files) {
      const filePath = path.join(partsPath, file);
      const content = await fs.readFile(filePath, "utf-8");
      mergedContent += content;
    }

    await fs.writeFile(mergedFilePath, mergedContent, "utf-8");
  } catch {
    throw new Error("FS operation failed");
  }
};

await merge();
