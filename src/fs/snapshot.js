import { writeFile, access } from "node:fs/promises";
import { resolve } from "path";
import { scanDirectory } from "./scanDirectory.js";

const snapshot = async () => {
  //workspace folder should be in the root like node-nodejs-fundamentals/workspace

  const workspaceDir = resolve("workspace");
  const snapshotPath = resolve("snapshot.json");

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
