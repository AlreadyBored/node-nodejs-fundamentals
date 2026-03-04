import fsPromises from "node:fs/promises";
import path from "path";
import {
  getFileContent,
  isFolderExists,
  encryptContent,
  drillDownFolder as drillDownFolderExt,
} from "../lib/utils.js";

const TARGET_FOLDER = "workspace";

const writeSnapshot = async (snapshot) => {
  try {
    await fsPromises.writeFile(
      "snapshot.json",
      JSON.stringify(snapshot, null, 2),
    );
  } catch (err) {
    throw new Error("FS operation failed");
  }
};

const snapshot = async () => {
  // Write your code here
  // Recursively scan workspace directory
  // Write snapshot.json with:
  // - rootPath: absolute path to workspace
  // - entries: flat array of relative paths and metadata

  const rootPath = path.resolve(TARGET_FOLDER);

  const isFolder = await isFolderExists(rootPath);

  if (!isFolder) {
    throw new Error("FS operation failed");
  }

  const context = { rootPath, entries: [] };

  await drillDownFolderExt(rootPath, {
    runOnFile: async ({ pathTo, metadata, other }) => {
      const contentRaw = await getFileContent(pathTo);

      other.entries.push({
        path: path.relative(other.rootPath, pathTo),
        size: metadata.size,
        type: "file",
        content: encryptContent(contentRaw),
      });
    },
    runOnFolder: ({ pathTo, other }) => {
      other.entries.push({
        path: path.relative(other.rootPath, pathTo),
        type: "directory",
      });
    },
    other: context,
  });

  await writeSnapshot(context);
};

await snapshot();
