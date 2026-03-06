import fs from "node:fs/promises";
import path from "node:path";

const merge = async () => {
  try {
    const workspaceAbsPath = path.join(process.cwd(), "workspace");
    const partsAbsPath = path.join(workspaceAbsPath, "parts");
    const mergedFileAbsPath = path.join(workspaceAbsPath, "merged.txt");

    const partsStat = await fs.stat(partsAbsPath);
    if (!partsStat.isDirectory()) {
      throw new Error("FS operation failed");
    }

    const args = process.argv;
    const filesIndex = args.indexOf("--files");
    let requestedFiles = null;

    if (filesIndex !== -1 && args[filesIndex + 1]) {
      requestedFiles = args[filesIndex + 1].split(",");
    }

    let filesToMerge;

    if (requestedFiles !== null) {
      for (const fileName of requestedFiles) {
        const fileAbsPath = path.join(partsAbsPath, fileName);
        const stat = await fs.stat(fileAbsPath);
        if (!stat.isFile()) {
          throw new Error("FS operation failed");
        }
      }
      filesToMerge = requestedFiles;
    } else {
      const dirEntries = await fs.readdir(partsAbsPath, {
        withFileTypes: true,
      });
      filesToMerge = dirEntries
        .filter(
          (entry) => entry.isFile() && path.extname(entry.name) === ".txt",
        )
        .map((entry) => entry.name)
        .sort();

      if (filesToMerge.length === 0) {
        throw new Error("FS operation failed");
      }
    }

    let mergedContent = "";
    for (const fileName of filesToMerge) {
      const fileAbsPath = path.join(partsAbsPath, fileName);
      const content = await fs.readFile(fileAbsPath, "utf8");
      mergedContent += content;
    }

    await fs.writeFile(mergedFileAbsPath, mergedContent, "utf8");
  } catch {
    throw new Error("FS operation failed");
  }
};

await merge();
