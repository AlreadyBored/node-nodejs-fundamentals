import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const merge = async () => {
  const args = process.argv.slice(2);
  const filesIndex = args.lastIndexOf("--files");
  const filesArg =
    filesIndex !== -1 && args[filesIndex + 1] ? args[filesIndex + 1] : null;
  const files = filesArg ? filesArg.split(",") : null;

  const partsPath = path.join(__dirname, "..", "..", "workspace", "parts");
  const outputPath = path.join(
    __dirname,
    "..",
    "..",
    "workspace",
    "merged.txt",
  );

  try {
    await fs.access(partsPath);
  } catch {
    throw new Error("FS operation failed");
  }

  let filesToMerge;

  if (files) {
    filesToMerge = files;
  } else {
    const allFiles = await fs.readdir(partsPath);
    filesToMerge = allFiles
      .filter((f) => f.endsWith(".txt"))
      .sort((a, b) => a.localeCompare(b));
    if (filesToMerge.length === 0) {
      throw new Error("FS operation failed");
    }
  }

  let result = "";

  for (const file of filesToMerge) {
    const filePath = path.join(partsPath, file);
    try {
      await fs.access(filePath);
    } catch {
      throw new Error("FS operation failed");
    }
    const content = await fs.readFile(filePath, "utf8");
    result += content;
  }

  await fs.writeFile(outputPath, result);
};

await merge();
