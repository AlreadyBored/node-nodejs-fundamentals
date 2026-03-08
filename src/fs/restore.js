import fs from 'node:fs/promises';
import path from 'node:path';

const getCliPath = () => {
  const pathArgIndex = process.argv.findIndex((arg) => arg === '--path');
  if (pathArgIndex !== -1 && process.argv[pathArgIndex + 1]) {
    return process.argv[pathArgIndex + 1];
  }
  if (process.argv[2] && process.argv[2] !== '--path') {
    return process.argv[2];
  }
  return 'workspace_restored';
};

const restore = async () => {
  const targetName = getCliPath();
  const restorePath = path.resolve(targetName);
  const snapshotPath = path.join(path.dirname(restorePath), 'snapshot.json');

  try {
    const stat = await fs.stat(restorePath);
    if (stat) {
      throw new Error('FS operation failed');
    }
  } catch (err) {
    if (err.message === 'FS operation failed') {
      throw err;
    }
  }

  let snapshotContent;
  try {
    snapshotContent = await fs.readFile(snapshotPath, 'utf8');
  } catch {
    throw new Error('FS operation failed');
  }

  const snapshot = JSON.parse(snapshotContent);

  await fs.mkdir(restorePath, { recursive: true });

  for (const entry of snapshot.entries) {
    const destPath = path.join(restorePath, entry.path);

    if (entry.type === 'directory') {
      await fs.mkdir(destPath, { recursive: true });
    } else if (entry.type === 'file') {
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      const buffer = Buffer.from(entry.content, 'base64');
      await fs.writeFile(destPath, buffer);
    }
  }
};

await restore();
