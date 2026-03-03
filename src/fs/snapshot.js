import { readdir, readFile, stat, access, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const snapshot = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const rootPath = join(__dirname, "workspace");

  try {
    await access(rootPath);
  } catch (error) {
    throw new Error("FS operation failed");
  }

  const snapshot = {
    rootPath,
    entries: [],
  };

  const files = await readdir(rootPath, { recursive: true });

  for (const file of files) {
    const stats = await stat(join(rootPath, file));
    const isDirectory = stats.isDirectory();

    const entry = {
      path: file,
    };

    if (isDirectory) {
      entry.type = "directory";
    } else {
      entry.type = "file";
      entry.size = stats.size;
      entry.content = await readFile(join(rootPath, file), "base64");
    }

    snapshot.entries.push(entry);
  }

  try {
    await writeFile(join(__dirname, "snapshot.json"), JSON.stringify(snapshot, null, 2));
    console.log(`Snapshot created successfully`);
  } catch (error) {
    throw new Error("Failed to create snapshot");
  }
};

await snapshot();
