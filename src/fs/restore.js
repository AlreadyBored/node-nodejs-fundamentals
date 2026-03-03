import { readFile, writeFile, mkdir, rmdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const restore = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const rootPath = join(__dirname, "workspace_restored");

  try {
    await mkdir(rootPath);
  } catch (error) {
    throw new Error("FS operation failed");
  }

  try {
    await readFile(join(__dirname, "snapshot.json"));
  } catch (error) {
    await rmdir(rootPath);
    throw new Error("FS operation failed");
  }

  const snapshot = JSON.parse(await readFile(join(__dirname, "snapshot.json"), "utf8"));

  for (const entry of snapshot.entries) {
    if (entry.type === "directory") {
      await mkdir(join(rootPath, entry.path));
    } else {
      await writeFile(join(rootPath, entry.path), Buffer.from(entry.content, "base64"));
    }
  }

  console.log(`Directory restored successfully from snapshot`);
};

await restore();
