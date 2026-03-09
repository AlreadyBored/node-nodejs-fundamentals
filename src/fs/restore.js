import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const restore = async () => {
  const rootPath = '/home/user/workspace_restored';

  try {
    const status = await stat(rootPath);
    if (!status.isDirectory()) {
      throw new Error('FS operation failed');
    }
  } catch {
    throw new Error('FS operation failed');
  }
  const snapshot = path.join(rootPath, '..', 'snapshot.json');
  const snapshotContent = await readFile(snapshot, 'utf-8');

  const { rootPath: snapshotRootPath, entries } = JSON.parse(snapshotContent);

  for (const entry of entries) {
    const fullPath = path.join(rootPath, entry.path);
    if (entry.type === 'directory') {
      await mkdir(fullPath, { recursive: true });
    } 
    
    if (entry.type === 'file') {
      await mkdir(path.dirname(fullPath), { recursive: true });
      await writeFile(fullPath, entry.content, 'base64');
    }
  }
};

await restore();
