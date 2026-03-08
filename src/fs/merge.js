import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { readdir, readFile, writeFile } from 'node:fs/promises';

const merge = async () => {
  const TEXT_EXT = 'txt';

  const rootPath = join(fileURLToPath(import.meta.url), '..', '..', '..', 'workspace/parts');
  let fullContent = '';

  const args = process.argv.slice(2);
  const fileNamesArgIndex = args.indexOf('--files');

  try {
    if (fileNamesArgIndex !== -1 && (fileNamesArgIndex + 1) < args.length) {
      const fileNames = args[fileNamesArgIndex + 1].split(',');

      for (const name of fileNames) {
        fullContent += await readFile(join(rootPath, `${name}.${TEXT_EXT}`));
      }
    } else {
      let isTextFileExist = false;
      const allEntries = (await readdir(rootPath, { withFileTypes: true })).sort();

      for (const entry of allEntries) {
        if (entry.isFile() && entry.name.endsWith(`.${TEXT_EXT}`)) {
          if (!isTextFileExist) {
            isTextFileExist = true;
          }

          fullContent += await readFile(join(rootPath, entry.name));
        }
      }

      if (!isTextFileExist) {
        throw new Error('FS operation failed\nThere are no files with the .txt extension in the folder.');
      }
    }
  } catch (error) {
    error.message = `FS operation failed\n${error.message}`;
    throw error;
  }

  await writeFile(join(rootPath, '..', 'merged.txt'), fullContent);
};

await merge();
