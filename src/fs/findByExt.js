import fs from "fs/promises";
import path from "path";

const findByExt = async () => {
  const workspace = path.join(process.cwd(), "workspace");

  let stat;
  try {
    stat = await fs.stat(workspace);
  } catch {
    throw new Error("FS operation failed");
  }

  if (!stat.isDirectory()) {
    throw new Error("FS operation failed");
  }

  const args = process.argv.slice(2);
  let ext = ".txt";

  const extIndex = args.indexOf("--ext");
  if (extIndex !== -1 && args[extIndex + 1]) {
    ext = "." + args[extIndex + 1];
  }

  const results = [];

  const walk = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith(ext)) {
        results.push(path.relative(workspace, path.join(dir, entry.name)));
      }
    }
  };

  await walk(workspace);
  results.sort();
  console.log(results);
};

await findByExt();
