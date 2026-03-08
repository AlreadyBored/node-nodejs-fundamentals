import { readFile, mkdir, writeFile, access, stat } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ensureDir = async (dirPath) => {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
};

const restore = async () => {
  const srcDir = join(__dirname, '..');
  const snapshotPath = join(srcDir, 'snapshot.json');
  const restoredPath = join(srcDir, 'workspace_restored');

  let snapshot;
  try {
    const data = await readFile(snapshotPath, 'utf-8');
    snapshot = JSON.parse(data);
  } catch (error) {
    throw new Error('FS operation failed');
  }

  try {
    await access(restoredPath);
    throw new Error('FS operation failed');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error('FS operation failed');
    }
  }

  await ensureDir(restoredPath);

  for (const entry of snapshot.entries) {
    const entryPath = join(restoredPath, entry.path);

    try {
      if (entry.type === 'directory') {
        await ensureDir(entryPath);
      } else if (entry.type === 'file') {
        const dirPath = dirname(entryPath);
        await ensureDir(dirPath);
        
        const contentBuffer = Buffer.from(entry.content, 'base64');
        await writeFile(entryPath, contentBuffer);
      }
    } catch (error) {
      console.error('Restore error for', entry.path, ':', error.message);
      throw new Error('FS operation failed');
    }
  }
};

await restore();
