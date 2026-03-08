import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { readFile, mkdir, writeFile, constants } from 'node:fs/promises';

const restore = async () => {
  const currentFilePath = fileURLToPath(import.meta.url);
  const rootPath = join(currentFilePath, '..', '..', '..', 'workspace_restored');
  const snapshotPath = join(currentFilePath, '..', '..', '..', 'snapshot.json');

  try {
    await mkdir(rootPath);

    const dirSnapshot = JSON.parse(await readFile(snapshotPath, { encoding: 'utf8' }));

    for (const entry of dirSnapshot.entries) {
      if (entry.type === 'directory') {
        await mkdir(join(rootPath, entry.path), { recursive: true });
        continue;
      }

      const fileData = Buffer.from(entry.content, "base64");

      await mkdir(join(rootPath, dirname(entry.path)), { recursive: true });
      await writeFile(join(rootPath, entry.path), fileData);
    }
  } catch (error) {
    error.message = `FS operation failed\n${error.message}`;
    throw error;
  }
};

await restore();
