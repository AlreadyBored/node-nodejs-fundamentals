import fs from "fs/promises";
import path from "path";

const findByExt = async () => {
  // Write your code here
  // Recursively find all files with specific extension
  // Parse --ext CLI argument (default: .txt)

  const root = process.cwd();
  const filesArray = [];
  async function scanDir(ext, dir) {
    const files = await fs.readdir(dir);
    for (let file of files) {
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) await scanDir(ext, fullPath);
      else {
        if (path.extname(file).replace(".", "") === ext) {
          filesArray.push(path.relative(root, fullPath));
        }
      }
    }
  }

  try {
    const index = process.argv.indexOf("--ext");
    if (index < 0) throw new Error("Not found");
    const ext = process.argv[index + 1];
    await scanDir(ext, root);
    console.log(filesArray);
  } catch (e) {
    console.error("Error\n", "FS operation failed", "\n\n");
  }
};

await findByExt();
