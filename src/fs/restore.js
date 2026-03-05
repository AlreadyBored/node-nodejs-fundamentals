import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const restore = async () => {
  // Write your code here
  // Read snapshot.json
  // Treat snapshot.rootPath as metadata only
  // Recreate directory/file structure in workspace_restored
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);
  const snapshotPath = path.resolve(currentDir, '../../snapshot.json');
  const restoreRoot = path.resolve(currentDir, '../../workspace_restored');

  try {
    const rawSnapshot = await readFile(snapshotPath, 'utf8');
    const snapshot = JSON.parse(rawSnapshot);

    if (!snapshot || !Array.isArray(snapshot.entries)) {
      throw new Error('Invalid snapshot format');
    }

    await rm(restoreRoot, { recursive: true, force: true });
    await mkdir(restoreRoot, { recursive: true });

    for (const entry of snapshot.entries) {
      if (!entry || typeof entry.path !== 'string' || typeof entry.type !== 'string') {
        throw new Error('Invalid snapshot entry');
      }

      const normalizedRelativePath = path.normalize(entry.path);
      const targetPath = path.resolve(restoreRoot, normalizedRelativePath);

      if (targetPath !== restoreRoot && !targetPath.startsWith(`${restoreRoot}${path.sep}`)) {
        throw new Error('Invalid snapshot entry path');
      }

      if (entry.type === 'directory') {
        await mkdir(targetPath, { recursive: true });
      } else if (entry.type === 'file') {
        const parentDir = path.dirname(targetPath);
        await mkdir(parentDir, { recursive: true });
        const content = typeof entry.content === 'string' ? Buffer.from(entry.content, 'base64') : Buffer.alloc(0);
        await writeFile(targetPath, content);
      } else {
        throw new Error('Invalid snapshot entry type');
      }
    }
  } catch {
    throw new Error('FS operation failed');
  }
};

await restore();
