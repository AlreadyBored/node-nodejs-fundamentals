import fs from "node:fs/promises";
import path from "node:path";

const snapshot = async () => {
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

  const entries = [];
  const snapshotFilePath = path.join(path.dirname(workspaceAbsPath), "snapshot.json");
  const snapshotData = { rootPath: workspaceAbsPath, entries };

  const scanDir = async (currentAbsPath) => {
    const dirEntries = await fs.readdir(currentAbsPath, {
      withFileTypes: true,
    });

    for (const dirEntry of dirEntries) {
      const entryAbsPath = path.join(currentAbsPath, dirEntry.name);
      const entryRelPath = path.relative(workspaceAbsPath, entryAbsPath);

      if (dirEntry.isDirectory()) {
        entries.push({ type: "directory", path: entryRelPath });
        await scanDir(entryAbsPath);
      } else if (dirEntry.isFile()) {
        const fileStat = await fs.stat(entryAbsPath);
        const fileSize = fileStat.size;
        const fileContent = await fs.readFile(entryAbsPath, "base64");

        entries.push({
          type: "file",
          path: entryRelPath,
          size: fileSize,
          content: fileContent,
        });
      }
    }
  };

  try {
    await scanDir(workspaceAbsPath);
    await fs.writeFile(snapshotFilePath, JSON.stringify(snapshotData, null, 2));
  } catch {
    throw new Error("FS operation failed");
  }
};

await snapshot();
