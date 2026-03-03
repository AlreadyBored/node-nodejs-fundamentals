import { access, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const findByExt = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const rootPath = join(__dirname, "workspace");

  try {
    await access(rootPath);
  } catch (error) {
    throw new Error("FS operation failed");
  }

  const extension = process.argv[3] || "txt";

  const files = await readdir(rootPath, { recursive: true });

  const sortedFilesWithExtension = files.filter((file) => file.endsWith(extension)).sort();
  
  for (const file of sortedFilesWithExtension) {
    console.log(file);
  }
};

await findByExt();
