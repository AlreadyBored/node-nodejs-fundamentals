import { promises as fs } from 'fs';
import { join, relative, resolve } from 'path';

const snapshot = async () => {
  const workspacePath = resolve(process.cwd(), 'workspace');
  const snapshotPath = resolve(process.cwd(), 'snapshot.json');

  try {
    const stats = await fs.stat(workspacePath);
    if (!stats.isDirectory()) {
      throw new Error('FS operation failed');
    }
  } catch (error) {
    throw new Error('FS operation failed');
  }

  const entries = [];

  const scan = async (dir) => {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = join(dir, file.name);
      const relPath = relative(workspacePath, fullPath);

      if (file.isDirectory()) {
        entries.push({ path: relPath, type: 'directory' });
        await scan(fullPath);
      } else if (file.isFile()) {
        const stats = await fs.stat(fullPath);
        const content = await fs.readFile(fullPath);
        entries.push({
          path: relPath,
          type: 'file',
          size: stats.size,
          content: content.toString('base64'),
        });
      }
    }
  };

  await scan(workspacePath);

  const result = {
    rootPath: workspacePath,
    entries,
  };

  await fs.writeFile(snapshotPath, JSON.stringify(result, null, 2));
};

await snapshot();
