import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const snapshot = async () => {
  const rootPath = '/home/user/workspace';

  try {
    const status = await stat(rootPath);
    if (!status.isDirectory()) {
      throw new Error('FS operation failed');
    }
  } catch {
    throw new Error('FS operation failed');
  }

  const childPaths = await readdir(rootPath, { recursive: true });
  const entries = [];

  for (const childPath of childPaths) {
    const normalizedPath = path.join(childPath).split(path.sep).join('/');
    const fullPath = path.join(rootPath, childPath);
    const info = await stat(fullPath);

    if (info.isDirectory()) {
      entries.push({ path: normalizedPath, type: 'directory' });
    } else if (info.isFile()) {
      const content = await readFile(fullPath);
      entries.push({
        path: normalizedPath,
        type: 'file',
        size: info.size,
        content: content.toString('base64'),
      });
    }
  }

  const snapshot = path.join(rootPath, '..', 'snapshot.json');
  await writeFile(
    snapshot,
    JSON.stringify({ rootPath, entries }),
    'utf-8'
  );
  
  await snapshot();
};

await snapshot();