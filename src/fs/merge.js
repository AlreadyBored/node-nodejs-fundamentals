import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { resolve, join, extname } from "node:path";

// Write your code here
// Default: read all .txt files from workspace/parts in alphabetical order
// Optional: support --files filename1,filename2,... to merge specific files in provided order
// Concatenate content and write to workspace/merged.txt

const merge = async () => {
  try {
    const workspacePath = resolve(process.cwd(), "workspace");
    const partsPath = join(workspacePath, "parts");
    const outputPath = join(workspacePath, "merged.txt");

    try {
      await stat(partsPath);
    } catch {
      throw new Error("FS operation failed");
    }

    const args = process.argv;
    const filesIndex = args.indexOf("--files");
    let filesToMerge = [];

    if (filesIndex !== -1 && args[filesIndex + 1]) {
      filesToMerge = args[filesIndex + 1].split(",");
    } else {
      const allFiles = await readdir(partsPath);
      filesToMerge = allFiles.filter((file) => extname(file) === ".txt").sort();
    }

    if (filesToMerge.length === 0) throw new Error("FS operation failed");

    let combinedContent = "";
    for (const fileName of filesToMerge) {
      const filePath = join(partsPath, fileName);
      try {
        const content = await readFile(filePath, "utf-8");
        combinedContent += content;
      } catch {
        throw new Error("FS operation failed");
      }
    }

    await writeFile(outputPath, combinedContent);
    process.stdout.write("merged.txt\n");
  } catch (error) {
    throw new Error("FS operation failed");
  }
};

await merge();
