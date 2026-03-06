import { isFileOrDirectoryExist } from "../utils/util.js";
import fs from 'node:fs/promises';

const compressDir = async () => {
  const targetPath = './workspace/toCompress/';
  isFileOrDirectoryExist('./workspace');
  isFileOrDirectoryExist(targetPath);

  try {
    const files = await fs.readdir(targetPath);

    for (const file of files) {

    }

  } catch (error) {
    
  }
  // Write your code here
  // Read all files from workspace/toCompress/
  // Compress entire directory structure into archive.br
  // Save to workspace/compressed/
  // Use Streams API
};

await compressDir();
