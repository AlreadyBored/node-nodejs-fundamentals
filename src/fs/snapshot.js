import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const rootPath = process.cwd();
const currentDir = path.dirname(fileURLToPath(import.meta.url));

const snapshot = async () => {
  // Write your code here
  // Recursively scan workspace directory
  // Write snapshot.json with:
  // - rootPath: absolute path to workspace
  // - entries: flat array of relative paths and metadata

  try {
    await fsPromises.access(rootPath);
  } catch {
    throw new Error('FS operation failed');
  }

  const entries = [];

  await scanRecursively(entries, rootPath);

  const data = {
    rootPath,
    entries,
  };

  await fsPromises.writeFile(
    path.join(currentDir, 'snapshot.json'),
    JSON.stringify(data, null, 2)
  );
};

const scanRecursively = async (entriesArr, currentPath, relativePath = '') => {
  const items = await fsPromises.readdir(currentPath, { withFileTypes: true });

  for (let i = 0; i < items.length; i += 1) {
    const name = items[i].name;

    if (name === 'snapshot.json') continue;

    const fullPath = path.join(currentPath, name);
    const nextRelativePath = path.join(relativePath, name);

    // console.log(fullPath);
    // console.log(nextRelativePath);

    if (items[i].isDirectory()) {
      entriesArr.push({ path: nextRelativePath, type: 'directory' });
      await scanRecursively(entriesArr, fullPath, nextRelativePath);
    } else {
      const stats = await fsPromises.stat(fullPath);
      const content = await fsPromises.readFile(fullPath, 'base64');

      entriesArr.push({
        path: nextRelativePath,
        type: 'file',
        size: stats.size,
        content,
      });
    }
  }
};

await snapshot();
