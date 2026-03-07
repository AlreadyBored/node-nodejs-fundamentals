import { readdir, access } from "node:fs/promises";
import { join, relative, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const findByExt = async () => {
  const workspacePath = join(__dirname, "workspace");

  try {
    await access(workspacePath);
  } catch {
    throw new Error("FS operation failed");
  }

  const args = process.argv.slice(2);
  const extIndex = args.indexOf("--ext");
  let ext = "txt";
  if (extIndex !== -1 && args[extIndex + 1]) {
    ext = args[extIndex + 1];
  }
  const targetExt = ext.startsWith(".") ? ext : `.${ext}`;

  const results = [];

  const walk = async (dir) => {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && extname(entry.name) === targetExt) {
        results.push(relative(workspacePath, fullPath));
      }
    }
  };

  await walk(workspacePath);

  results.sort().forEach((filePath) => console.log(filePath));
};

await findByExt();
