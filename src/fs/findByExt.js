import fs from "node:fs/promises";
import path from "node:path";

const findByExt = async () => {
  const workspaceAbsPath = path.join(process.cwd(), "workspace");

  let stat;
  try {
    stat = await fs.stat(workspaceAbsPath);
  } catch {
    throw new Error("FS operation failed");
  }

  if (!stat.isDirectory()) {
    throw new Error("FS operation failed");
  }

  const args = process.argv;
  const extIndex = args.indexOf("--ext");
  let extension = ".txt";
  if (extIndex !== -1 && args[extIndex + 1]) {
    const rawExt = args[extIndex + 1];
    extension = rawExt.startsWith(".") ? rawExt : `.${rawExt}`;
  }
  const results = [];

  const scanDir = async (currentAbsPath) => {
    const dirEntries = await fs.readdir(currentAbsPath, {
      withFileTypes: true,
    });
    for (const dirEntry of dirEntries) {
      const entryAbsPath = path.join(currentAbsPath, dirEntry.name);
      if (dirEntry.isDirectory()) {
        await scanDir(entryAbsPath);
      } else if (dirEntry.isFile() && path.extname(dirEntry.name) === extension) {
        const entryRelPath = path.relative(workspaceAbsPath, entryAbsPath);
        results.push(entryRelPath);
      }
    }
  };

  try{
    await scanDir(workspaceAbsPath);
    results.sort().forEach((result) => console.log(result));
  } catch {
    throw new Error("FS operation failed");
  }
};

await findByExt();
