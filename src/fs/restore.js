import {
  createFolder,
  getFileContent,
  isFolderExists,
  createFileWithContent,
  decryptContent,
} from "../lib/utils.js";
import path from "path";

const FOLDER_NAME = "workspace_restored";

const restore = async () => {
  // Write your code here
  // Read snapshot.json
  // Treat snapshot.rootPath as metadata only
  // Recreate directory/file structure in workspace_restored

  const folderExists = await isFolderExists(FOLDER_NAME);
  if (folderExists) {
    throw new Error("FS operation failed");
  }

  await createFolder(FOLDER_NAME);

  const snapshotRaw = await getFileContent("snapshot.json");
  const snapshot = JSON.parse(snapshotRaw);

  await Promise.all(
    snapshot.entries.map(async (entry) => {
      if (entry.type === "directory") {
        await createFolder(path.join(FOLDER_NAME, entry.path));
      } else if (entry.type === "file") {
        const content = await decryptContent(entry.content);
        await createFileWithContent(path.join(FOLDER_NAME, entry.path), content);
      }
    }),
  );
};

await restore();
