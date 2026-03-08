import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { readdir } from 'node:fs/promises';

const findByExt = async () => {
  const getDirEntries = async (path) => {
    const childElements = await readdir(path, { withFileTypes: true });
    const dirEntries = [];

    for (const element of childElements) {
      const elementName = element.name;

      if (element.isFile()) {
        dirEntries.push(elementName);
        continue;
      }

      const fullPath = join(path, elementName);
      const subDirEntries = await getDirEntries(fullPath);

      dirEntries.push(...subDirEntries.map(entry => join(elementName, entry)));
    }

    return dirEntries;
  };

  const DEFAULT_EXT = 'txt';

  const args = process.argv.slice(2);
  const extArgIndex = args.indexOf('--ext');
  const ext = (extArgIndex !== -1 && (extArgIndex + 1) < args.length) ? args[extArgIndex + 1] : DEFAULT_EXT;

  const rootPath = join(fileURLToPath(import.meta.url), '..', '..', '..', 'workspace');

  try {
    const dirEntries = await getDirEntries(rootPath);
    const extFilePaths = dirEntries.flat(Infinity).filter(filePath => filePath.endsWith(`.${ext}`)).sort();

    console.log(extFilePaths.join('\n'));
  } catch (error) {
    error.message = `FS operation failed\n${error.message}`;
    throw error;
  }
};

await findByExt();
