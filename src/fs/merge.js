import { readdir, readFile, writeFile, access } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const merge = async () => {
  const workspacePath = join(__dirname, "workspace");
  const partsPath = join(workspacePath, "parts");

  try {
    await access(partsPath);
  } catch {
    throw new Error("FS operation failed");
  }

  const args = process.argv.slice(2);
  const filesIndex = args.indexOf("--files");

  let filesToMerge;

  if (filesIndex !== -1 && args[filesIndex + 1]) {
    filesToMerge = args[filesIndex + 1].split(",");

    for (const fileName of filesToMerge) {
      try {
        await access(join(partsPath, fileName));
      } catch {
        throw new Error("FS operation failed");
      }
    }
  } else {
    const allEntries = await readdir(partsPath);
    filesToMerge = allEntries.filter((name) => extname(name) === ".txt").sort();

    if (filesToMerge.length === 0) {
      throw new Error("FS operation failed");
    }
  }

  const contents = [];
  for (const fileName of filesToMerge) {
    const content = await readFile(join(partsPath, fileName), "utf-8");
    contents.push(content);
  }

  await writeFile(
    join(workspacePath, "merged.txt"),
    contents.join(""),
    "utf-8",
  );
};

await merge();
