import fsPromises from "node:fs/promises";

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
    console.log('>>> err', err);
    throw new Error("FS operation failed");
  }
};

export const encryptContent = (content) => {
  return new Buffer.from(content).toString("base64");
};

export const decryptContent = (encryptedContent) => {
  return new Buffer.from(encryptedContent, "base64").toString("utf-8");
};