import fsPromises from "node:fs/promises";
import path from "node:path";

export const isFolderExists = async (folderPath) => {
  try {
    await fsPromises.access(folderPath);
    return true;
  } catch (err) {
    return false;
  }
};

export const getFileContent = async (filePath) => {
  try {
    const content = await fsPromises.readFile(filePath, "utf-8");
    return content;
  } catch (err) {
    throw new Error("FS operation failed");
  }
};

export const createFileWithContent = async (filePath, content) => {
  try {
    await fsPromises.writeFile(filePath, content);
  } catch (err) {
    throw new Error("FS operation failed");
  }
};

export const createFolder = async (folderPath) => {
  try {
    await fsPromises.mkdir(folderPath, { recursive: true });
  } catch (err) {
    throw new Error("FS operation failed");
  }
};

export const encryptContent = (content) => {
  return new Buffer.from(content).toString("base64");
};

export const decryptContent = (encryptedContent) => {
  return new Buffer.from(encryptedContent, "base64").toString("utf-8");
};
/**
 *
 * @param {*} folderPath - pass itinial path to the target folder
 * @param {Object} options - includes runOnFolder and runOnFile callbacks
 * @param {Function | function(): Promise<any>} [options.runOnFolder] - callback executed for each folder
 * @param {Function | function(): Promise<any>} [options.runOnFile] - callback executed for each file
 * @param {*} [options.other] - any other properties will be passed to runOnFolder and runOnFile callbacks
 */
export const drillDownFolder = async (folderPath, options) => {
  const { runOnFolder, runOnFile, other } = options;
  const absolutePath = path.resolve(folderPath);
  const folderContent = await getFolderContent(absolutePath);

  await Promise.all(
    folderContent.map(async (folderItem) => {
      const pathTo = path.join(folderPath, folderItem);
      const metadata = await getFileMetadata(path.resolve(pathTo));

      if (metadata.isDirectory()) {
        runOnFolder &&
          await runOnFolder({
            pathTo,
            metadata,
            other,
          });
        await drillDownFolder(path.join(folderPath, folderItem), options);
      } else if (metadata.isFile()) {
        runOnFile &&
          await runOnFile({
            pathTo,
            metadata,
            other,
          });
      } else {
        // context.entries.push({ path: pathTo, type: "other" }); - ?
        throw new Error("FS operation failed");
      }
    }),
  );
};

export const getFolderContent = async (folderPath) => {
  try {
    const content = await fsPromises.readdir(folderPath);
    return content;
  } catch (err) {
    throw new Error("FS operation failed");
  }
};

export const getFileMetadata = async (filePath) => {
  try {
    const stats = await fsPromises.stat(filePath);
    return stats;
  } catch (err) {
    throw new Error("FS operation failed");
  }
};
