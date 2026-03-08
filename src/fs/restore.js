import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const restore = async () => {
  const baseDir = path.join(__dirname, '../../');
  const snapshotPath = path.join(baseDir, 'snapshot.json');
  const restoredDir = path.join(baseDir, 'workspace_restored');

  try {
    await fs.access(snapshotPath);
  } catch {
    throw new Error('FS operation failed');
  }

  try {
    await fs.access(restoredDir);
    throw new Error('FS operation failed');
  } catch {
    // If error, directory does not exist, continue
  }

  let snapshot;
  try {
    const data = await fs.readFile(snapshotPath, 'utf8');
    snapshot = JSON.parse(data);
  } catch {
    throw new Error('FS operation failed');
  }

  for (const entry of snapshot.entries) {
    const entryPath = path.join(restoredDir, entry.path);
    if (entry.type === 'directory') {
      try {
        await fs.mkdir(entryPath, { recursive: true });
      } catch {
        throw new Error('FS operation failed');
      }
    } else if (entry.type === 'file') {
      await fs.mkdir(path.dirname(entryPath), { recursive: true });
      try {
        const content = Buffer.from(entry.content, 'base64');
        await fs.writeFile(entryPath, content);
      } catch {
        throw new Error('FS operation failed');
      }
    }
  }
};

await restore();