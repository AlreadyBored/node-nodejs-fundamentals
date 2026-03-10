import fs from "fs/promises";
import path from "path";

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt

  const root = path.join(process.cwd(), "part");
  let textFiles = [];
  async function readDirectory(pathDir) {
    const files = await fs.readdir(pathDir);
    for (const file of files) {
      const fullPath = path.join(pathDir, file);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        await readDirectory(fullPath);
      } else {
        if (path.extname(fullPath) === ".txt") {
          textFiles.push(fullPath);
        }
      }
    }
  }
  try {
    await readDirectory(root);
    if (textFiles.length === 0) {
      throw new Error();
    }
    textFiles.sort((file1, file2) => {
      return path.basename(file1).localeCompare(path.basename(file2));
    });
    let result = "";
    for (const file of textFiles) {
      const content = await fs.readFile(file);
      result += content + "\n";
    }
    await fs.writeFile(path.join(process.cwd(), "merged.txt"), result);
  } catch {
    console.error("Error:\n", "FS operation failed", "\n");
  }
};

await merge();
