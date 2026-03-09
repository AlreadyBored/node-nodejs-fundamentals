import fs from "fs/promises";
import path from "path";

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt
  let filesToMerge = [];
  let result = "";
  const folderPath = "./workspace/parts";
  try {
    await fs.access(folderPath);

    const extIndex = process.argv.indexOf("--files");
    if (extIndex !== -1) {
      filesToMerge = process.argv[extIndex + 1].split(",");
    } else {
      let entries = await fs.readdir(folderPath, { withFileTypes: true });

      let step1 = entries.filter((e) => e.isFile() && e.name.endsWith(".txt"));
      let step2 = step1.map((e) => e.name);
      filesToMerge = step2.sort();
    }
    if (filesToMerge.length === 0) throw new Error();
    for (const file of filesToMerge) {
      const entry = await fs.readFile(path.join(folderPath, file), "utf8");
      result += entry;
      console.log(result);
    }
    await fs.writeFile("./workspace/merged.txt", result);
  } catch {
    throw new Error("FS operation failed");
  }
};

await merge();
