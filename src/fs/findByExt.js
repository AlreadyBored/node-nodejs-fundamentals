import { readdir, stat } from "fs/promises";
import { join, relative, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const directoryName = dirname(fileURLToPath(import.meta.url));

export const findByExt = async () => {
  const args = process.argv;
  const extIndex = args.indexOf("--ext");

  const ext = extIndex !== -1 ? args[extIndex + 1] : "txt";

  const dotExt = ext.startsWith(".") ? ext : `.${ext}`;

  const workspacePath = join(directoryName, "workspace");

  await stat(workspacePath).catch(() => {
    throw new Error("FS operation failed");
  });

  const found = [];

  async function scan(dir) {
    const items = await readdir(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const info = await stat(fullPath);

      if (info.isDirectory()) {
        await scan(fullPath);
      } else {
        if (extname(item) === dotExt) {
          found.push(relative(workspacePath, fullPath));
        }
      }
    }
  }

  await scan(workspacePath);

  found.sort().forEach((p) => console.log(p));
};

await findByExt();
