import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const scanDirectory = async (dirPath, rootPath) => {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    const relPath = relative(rootPath, fullPath);

    if (entry.isDirectory()) {
      result.push({
        path: relPath,
        type: 'directory'
      });
      
      const subEntries = await scanDirectory(fullPath, rootPath);
      result.push(...subEntries);
    } else {
      const stats = await stat(fullPath);
      const content = await readFile(fullPath);
      const base64Content = content.toString('base64');
      
      result.push({
        path: relPath,
        type: 'file',
        size: stats.size,
        content: base64Content
      });
    }
  }

  return result;
};

const snapshot = async () => {
  const srcDir = join(__dirname, '..');
  const workspacePath = join(srcDir, 'workspace');
  const snapshotPath = join(srcDir, 'snapshot.json');

  try {
    const stats = await stat(workspacePath);
    if (!stats.isDirectory()) {
      throw new Error('FS operation failed');
    }
  } catch (error) {
    throw new Error('FS operation failed');
  }

  const entries = await scanDirectory(workspacePath, workspacePath);

  const snapshotData = {
    rootPath: workspacePath,
    entries: entries
  };

  await writeFile(snapshotPath, JSON.stringify(snapshotData, null, 2));
};

await snapshot();
