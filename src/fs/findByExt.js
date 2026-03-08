import fs from "node:fs/promises";
import path from "node:path";

const findByExt = async () => {
  // Write your code here
  // Recursively find all files with specific extension
  // Parse --ext CLI argument (default: .txt)

  /*   console.log(process.argv); */

  const extIndex = process.argv.indexOf("--ext");
  const extension = extIndex !== -1 ? "." + process.argv[extIndex + 1] : ".txt";

  const startDir = process.cwd();

  const search = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await search(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(extension)) {
        console.log(fullPath);
      }
    }
  };

  await search(startDir);
};

await findByExt();
