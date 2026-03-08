import { readdir, readFile, stat, writeFile } from "fs/promises";
import { join, relative } from "path";

export const snapshot = async (workspacePath) => {
  await stat(workspacePath).catch(() => {
    throw new Error("FS operation failed");
  });

  const entries = [];

  async function scan(dir) {
    const items = await readdir(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const relPath = relative(workspacePath, fullPath);
      const info = await stat(fullPath);

      if (info.isDirectory()) {
        entries.push({ path: relPath, type: "directory" });
        await scan(fullPath);
      } else {
        const fileBytes = await readFile(fullPath);
        entries.push({
          path: relPath,
          type: "file",
          size: info.size,
          content: fileBytes.toString("base64"),
        });
      }
    }
  }

  await scan(workspacePath);

  const result = { rootPath: workspacePath, entries };
  const saveTo = join(workspacePath, "..", "snapshot.json");

  await writeFile(saveTo, JSON.stringify(result, null, 2));
};

await snapshot(new URL("workspace", import.meta.url).pathname);
