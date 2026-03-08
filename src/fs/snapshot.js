import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { readFile } from 'fs/promises';

const snapshot = async () => {
  const workspace = join(process.cwd(), 'workspace');
  const snapshotPath = join(process.cwd(), 'snapshot.json');

  const entries = [];

  const scan = async (dirPath, relBase = '') => {
    let stats;
    try {
      stats = await stat(dirPath);
    } catch {
      throw new Error('FS operation failed');
    }

    if (!stats.isDirectory()) return;

    const items = await readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = join(dirPath, item.name);
      const relPath = relBase ? `${relBase}/${item.name}` : item.name;

      if (item.isDirectory()) {
        entries.push({ path: relPath, type: 'directory' });
        await scan(fullPath, relPath);
      } else {
        const content = await readFile(fullPath);
        entries.push({
          path: relPath,
          type: 'file',
          size: content.length,
          content: content.toString('base64'),
        });
      }
    }
  };

  try {
    await stat(workspace);
  } catch {
    throw new Error('FS operation failed');
  }

  await scan(workspace);

  const snapshotData = {
    rootPath: workspace,
    entries,
  };

  const { writeFile } = await import('fs/promises');
  await writeFile(snapshotPath, JSON.stringify(snapshotData, null, 2));
};

await snapshot();
