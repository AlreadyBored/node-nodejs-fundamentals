import fs from 'fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { WORKSPACE_DIR, PARTS_DIR } from '../constants.js';

const writeMergedFile = async (files) => {
  const mergedFilePath = path.join(WORKSPACE_DIR, 'merged.txt');

  try {
    await fs.promises.rm(mergedFilePath, { force: true });

    for (const file of files) {
      const readStream = fs.createReadStream(file);

      readStream.on('error', (err) => {
        throw new Error(`FS operation failed: ${err.message}`);
      });

      const writeStream = fs.createWriteStream(mergedFilePath, { flags: 'a' });

      readStream.pipe(writeStream);
    }
  } catch (err) {
    throw new Error(`FS operation failed: ${err.message}`);
  }
};

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt

  try {
    const filesDir = path.join(WORKSPACE_DIR, PARTS_DIR);

    const files = await fs.promises.readdir(filesDir);

    const options = {
      files: {
        type: 'string',
        short: 'f',
      },
    };
    const { values } = parseArgs({ options });

    if (values.files) {
      const filesToMerge = values.files
        .split(',')
        .map((file) => path.join(filesDir, file));
      writeMergedFile(filesToMerge);
      return;
    }

    const txtFilesSorted = files
      .filter((file) => path.extname(file) === '.txt')
      .sort((a, b) => a.localeCompare(b));
    const txtFilesSortedWithPath = txtFilesSorted.map((file) =>
      path.join(filesDir, file),
    );

    writeMergedFile(txtFilesSortedWithPath);
  } catch (err) {
    throw new Error(`FS operation failed: ${err.message}`);
  }
};

await merge();
