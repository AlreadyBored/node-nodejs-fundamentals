import path from "node:path";
import { writeFile } from "node:fs/promises";
import { scanDirectory } from "./scanDirectory.js";
import { resolve } from "path";

const merge = async () => {
  const workspaceDir = resolve("workspace");
  const partsDir = path.join(workspaceDir, "parts");
  const outputFile = path.join(workspaceDir, "merged.txt");

  const args = process.argv.slice(2);
  const filesIndex = args.indexOf("--files");

  let requestedFiles = null;
  if (filesIndex !== -1 && args[filesIndex + 1]) {
    requestedFiles = args[filesIndex + 1]
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
  }

  try {
    const entries = await scanDirectory(partsDir);
    const allFiles = entries.filter((entry) => entry.type === "file");

    let filesToMerge;

    if (requestedFiles) {
      filesToMerge = requestedFiles.map((requestedFileName) => {
        const fileEntry = allFiles.find(
          (file) => path.basename(file.path) === requestedFileName,
        );
        if (!fileEntry) throw new Error("FS operation failed");
        return fileEntry;
      });
    } else {
      filesToMerge = allFiles
        .filter((file) => path.extname(file.path) === ".txt")
        .sort((a, b) => a.path.localeCompare(b.path));

      if (filesToMerge.length === 0) {
        throw new Error("FS operation failed");
      }
    }

    const mergedContent = filesToMerge
      .map((file) => Buffer.from(file.content, "base64").toString("utf8"))
      .join("\n");

    await writeFile(outputFile, mergedContent, "utf8");
    console.log("Operation done, you can see result in workspace/merged.txt");
  } catch {
    throw new Error("FS operation failed");
  }
};

await merge();
