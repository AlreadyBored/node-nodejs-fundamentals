import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const snapshot = async () => {
  // Recursively scan workspace directory
  // Write snapshot.json with:
  // - rootPath: absolute path to workspace
  // - entries: flat array of relative paths and metadata
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);
  const workspaceRoot = path.resolve(currentDir, '../../workspace');
  const snapshotPath = path.resolve(currentDir, '../../snapshot.json');
  debugger; 
  const entries = [];

  const toSnapshotPath = (absolutePath) => path.relative(workspaceRoot, absolutePath).split(path.sep).join('/');

  const scanDirectory = async (directory) => {
    const items = await readdir(directory, { withFileTypes: true });
    items.sort((firstItem, secondItem) => firstItem.name.localeCompare(secondItem.name));

    for (const item of items) {
      const itemPath = path.join(directory, item.name);
      const relativePath = toSnapshotPath(itemPath);

      if (item.isDirectory()) {
        entries.push({
          path: relativePath,
          type: 'directory',
        });
        await scanDirectory(itemPath);
      } else if (item.isFile()) {
        const fileStats = await stat(itemPath);
        const content = await readFile(itemPath);

        entries.push({
          path: relativePath,
          type: 'file',
          size: fileStats.size,
          content: content.toString('base64'),
        });
      }
    }
  };

  try {
    await scanDirectory(workspaceRoot);
    const snapshotData = {
      rootPath: workspaceRoot,
      entries,
    };

    await writeFile(snapshotPath, JSON.stringify(snapshotData, null, 2), 'utf8');
  } catch {
    throw new Error('FS operation failed');
  }
};

await snapshot();
