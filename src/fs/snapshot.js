import { writeFile, readdir, stat, readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, "../../workspace");

async function scanDir(absDir, relativeDir = "") {
  let entries;
  try {
    entries = await readdir(absDir, { withFileTypes: true });
  } catch {
    throw new Error("FS operation failed");
  }

  const contentEntries = [];

  for (const entry of entries) {
    const absPath = path.resolve(absDir, entry.name);
    const relativePath = relativeDir
      ? path.join(relativeDir, entry.name)
      : entry.name;

    if (entry.isDirectory()) {
      contentEntries.push({
        path: relativePath,
        type: "directory",
      });

      const nested = await scanDir(absPath, relativePath);
      contentEntries.push(...nested);
    } else if (entry.isFile()) {
      const fileStat = await stat(absPath);
      const buffer = await readFile(absPath);

      contentEntries.push({
        path: relativePath,
        type: "file",
        size: fileStat.size,
        content: buffer.toString("base64"),
      });
    }
  }
  return contentEntries;
}

const snapshot = async () => {
  try {
    await access(workspaceDir);
  } catch {
    throw new Error("FS operation failed");
  }

  const entries = await scanDir(workspaceDir);
  const content = {
    rootPath: workspaceDir,
    entries,
  };
  try {
    await writeFile(
      "./snapshot.json",
      JSON.stringify(content, null, 2),
      "utf8",
    );
  } catch (e) {
    console.error(e);
  }
};

await snapshot();
