import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const restore = async () => {
  const snapshotPath = join(fileURLToPath(import.meta.url), '..', 'snapshot.json');
  const restoreDir = join(fileURLToPath(import.meta.url), '..', 'workspace_restored');

  const snapshotData = JSON.parse(await readFile(snapshotPath, 'utf-8'));

  await mkdir(restoreDir, { recursive: true });

  for (const entry of snapshotData.entries) {
    const targetPath = join(restoreDir, entry.path);

    if (entry.type === 'directory') {
      await mkdir(targetPath, { recursive: true });
    } else {
      await mkdir(dirname(targetPath), { recursive: true });
      const content = Buffer.from(entry.content, 'base64');
      await writeFile(targetPath, content);
    }
  }

  console.log(`Restored ${snapshotData.entries.length} entries to ${restoreDir}`);
};

await restore();
