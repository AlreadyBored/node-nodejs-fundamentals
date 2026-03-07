import { readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const snapshot = async () => {
  const workspacePath = join(fileURLToPath(import.meta.url), '..', 'workspace');
  const snapshotPath = join(fileURLToPath(import.meta.url), '..', 'snapshot.json');

  const entries = [];

  const scan = async (dir) => {
    const items = await readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = join(dir, item.name);
      const relativePath = relative(workspacePath, fullPath);

      if (item.isDirectory()) {
        entries.push({ path: relativePath, type: 'directory' });
        await scan(fullPath);
      } else {
        const fileStat = await stat(fullPath);
        const content = await readFile(fullPath);
        entries.push({
          path: relativePath,
          type: 'file',
          size: fileStat.size,
          content: content.toString('base64'),
        });
      }
    }
  };

  await scan(workspacePath);

  const snapshotData = {
    rootPath: workspacePath,
    entries,
  };

  await writeFile(snapshotPath, JSON.stringify(snapshotData, null, 2), 'utf-8');
  console.log(`Snapshot saved to ${snapshotPath} (${entries.length} entries)`);
};

await snapshot();
