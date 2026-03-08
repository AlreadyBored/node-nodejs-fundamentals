import { readdir, readFile, writeFile, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const directoryName = dirname(fileURLToPath(import.meta.url));

export const merge = async () => {
  const workspacePath = join(directoryName, "workspace");
  const partsPath = join(workspacePath, "parts");

  await stat(partsPath).catch(() => {
    throw new Error("FS operation failed");
  });

  const args = process.argv;
  const filesIndex = args.indexOf("--files");

  let filesToMerge = [];

  if (filesIndex !== -1) {
    const fileNames = args[filesIndex + 1].split(",");

    for (const name of fileNames) {
      const fullPath = join(partsPath, name);
      await stat(fullPath).catch(() => {
        throw new Error("FS operation failed");
      });
      filesToMerge.push(fullPath);
    }
  } else {
    const items = await readdir(partsPath);
    filesToMerge = items
      .filter((item) => item.endsWith(".txt"))
      .sort()
      .map((item) => join(partsPath, item));

    if (filesToMerge.length === 0) {
      throw new Error("FS operation failed");
    }
  }

  const currentChunks = [];
  for (const filePath of filesToMerge) {
    const text = await readFile(filePath, "utf-8");
    currentChunks.push(text);
  }

  await writeFile(join(workspacePath, "merged.txt"), currentChunks.join(""));
};

await merge();
