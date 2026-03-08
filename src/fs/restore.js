import { readFile, mkdir, writeFile, access } from 'fs/promises';
import { join } from 'path';

const restore = async () => {
  const snapshotPath = join(process.cwd(), 'snapshot.json');
  const restoreDir = join(process.cwd(), 'workspace_restored');

  let snapshotData;
  try {
    const content = await readFile(snapshotPath, 'utf-8');
    snapshotData = JSON.parse(content);
  } catch {
    throw new Error('FS operation failed');
  }

  try {
    await access(restoreDir);
    throw new Error('FS operation failed');
  } catch (err) {
    if (err.message === 'FS operation failed') throw err;
  }

  const { rootPath, entries } = snapshotData;

  for (const entry of entries) {
    const fullPath = join(restoreDir, entry.path);

    if (entry.type === 'directory') {
      await mkdir(fullPath, { recursive: true });
    } else {
      const dir = join(fullPath, '..');
      await mkdir(dir, { recursive: true });
      const content = Buffer.from(entry.content, 'base64');
      await writeFile(fullPath, content);
    }
  }
};

await restore();
