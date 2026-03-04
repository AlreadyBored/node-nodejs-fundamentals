import { writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scanDirectory } from "./scanDirectory.js";

const snapshot = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const workspaceDir = path.resolve(__dirname, "workspace"); //workspace folder should be inside src/fs
  const snapshotPath = path.resolve(__dirname, "snapshot.json");

  try {
    await access(workspaceDir);
  } catch {
    throw new Error("FS operation failed");
  }

  const entries = await scanDirectory(workspaceDir);
  const content = {
    rootPath: workspaceDir,
    entries,
  };
  try {
    await writeFile(snapshotPath, JSON.stringify(content, null, 2), "utf8");
    console.log("Snapshot is successfully created");
  } catch (e) {
    console.error(e);
  }
};

await snapshot();
