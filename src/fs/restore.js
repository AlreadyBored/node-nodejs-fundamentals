import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const restore = async () => {
  const snapshotPath = join(__dirname, "snapshot.json");

  try {
    await access(snapshotPath);
  } catch {
    throw new Error("FS operation failed");
  }

  const restoredDir = join(__dirname, "workspace_restored");

  const exists = await access(restoredDir)
    .then(() => true)
    .catch(() => false);
  if (exists) {
    throw new Error("FS operation failed");
  }

  const raw = await readFile(snapshotPath, "utf-8");
  const snapshotData = JSON.parse(raw);

  await mkdir(restoredDir, { recursive: true });

  for (const entry of snapshotData.entries) {
    const targetPath = join(restoredDir, entry.path);

    if (entry.type === "directory") {
      await mkdir(targetPath, { recursive: true });
    } else if (entry.type === "file") {
      await mkdir(dirname(targetPath), { recursive: true });
      const content = Buffer.from(entry.content, "base64");
      await writeFile(targetPath, content);
    }
  }
};

await restore();
