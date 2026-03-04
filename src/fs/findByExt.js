import { readdir, access } from "node:fs/promises";
import { join, relative, extname, resolve, dirname } from "path";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspacePath = path.resolve(__dirname, "workspace");

const readDirectory = async (dir, targetExt, relativePath = "") => {
  const entries = await readdir(dir, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    const relPath = relativePath
      ? path.join(relativePath, entry.name)
      : entry.name;

    if (entry.isDirectory()) {
      const nested = await readDirectory(fullPath, targetExt, relPath);
      result.push(...nested);
    } else if (entry.isFile()) {
      if (path.extname(entry.name) === targetExt) {
        result.push(relPath);
      }
    }
  }

  return result;
};

const findByExt = async () => {
  const args = process.argv.slice(2);
  const extIndex = args.indexOf("--ext");

  let targetExt = ".txt";

  if (extIndex !== -1 && args[extIndex + 1]) {
    targetExt = `.${args[extIndex + 1]}`;
  }

  try {
    await access(workspacePath);
  } catch {
    throw new Error("FS operation failed");
  }

  const fileList = await readDirectory(workspacePath, targetExt);

  fileList.sort().forEach((path) => console.log(path));
};

await findByExt();
