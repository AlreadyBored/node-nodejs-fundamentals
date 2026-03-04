import fsPromises from "node:fs/promises";
import path from "path";
import { getFileContent, isFolderExists, encryptContent } from "../lib/utils.js";

const TARGET_FOLDER = "workspace";

const getFileMetadata = async (filePath) => {
  try {
    const stats = await fsPromises.stat(filePath);
    return stats;
  } catch (err) {
    throw new Error("FS operation failed");
  }
};

const getFolderContent = async (folderPath) => {
  try {
    const content = await fsPromises.readdir(folderPath);
    return content;
  } catch (err) {
    throw new Error("FS operation failed");
  }
};

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

// console.log(import.meta.dirname);
const snapshot = async () => {
  // Write your code here
  // Recursively scan workspace directory
  // Write snapshot.json with:
  // - rootPath: absolute path to workspace
  // - entries: flat array of relative paths and metadata

  const rootPath = path.resolve(TARGET_FOLDER);

  await isFolderExists(rootPath);

  const context = { rootPath, entries: [] };

  await drillDownFolder([], context);

  await writeSnapshot(context);
};

const drillDownFolder = async (folderPath, context) => {
  const absolutePath = path.join(context.rootPath, ...folderPath);
  const content = await getFolderContent(absolutePath);

  await Promise.all(
    content.map(async (item) => {
      const itemPath = path.join(absolutePath, item);
      const metadata = await getFileMetadata(itemPath);
      const pathTo = `${folderPath.length > 0 ? folderPath.join("/") + "/" : ""}${item}`;

      if (metadata.isDirectory()) {
        context.entries.push({
          path: pathTo,
          type: "directory",
        });
        await drillDownFolder([...folderPath, item], context);
      } else if (metadata.isFile()) {
        const contentRaw = await getFileContent(itemPath);

        context.entries.push({
          path: pathTo,
          size: metadata.size,
          type: "file",
          content: encryptContent(contentRaw),
        });
      } else {
        // context.entries.push({ path: pathTo, type: "other" }); - ?
        throw new Error("FS operation failed");
      }
    }),
  );
};

await snapshot();
