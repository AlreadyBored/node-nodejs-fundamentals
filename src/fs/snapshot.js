import fs from 'fs/promises';
import path from 'path';

const scanDir = async (dir, rootPath, entries = []) => {
  const items = await fs.readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(rootPath, fullPath);

    if (item.isDirectory()) {
      entries.push({
        path: relativePath,
        type: "directory"
      });

      await scanDir(fullPath, rootPath, entries);
    } else {
      const stats = await fs.stat(fullPath);
      const buffer = await fs.readFile(fullPath);

      entries.push({
        path: relativePath,
        type: "file",
        size: stats.size,
        content: buffer.toString('base64')
      });
    }
  }

  return entries;
};

const snapshot = async () => {
  const rootPath = path.resolve('workspace');

  const entries = await scanDir(rootPath, rootPath);

  entries.sort((a, b) => a.path.localeCompare(b.path));

  const result = {
    rootPath,
    entries
  };

  await fs.writeFile(
    'snapshot.json',
    JSON.stringify(result, null, 2)
  );
};

await snapshot();