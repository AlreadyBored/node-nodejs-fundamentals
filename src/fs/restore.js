import path from 'path';
import fs from 'fs/promises';

const restore = async () => {
  const snapshotPath = path.resolve(process.cwd(), 'snapshot.json');
  const restoreDir = path.resolve(process.cwd(), 'workspace_restored');

  let data;
  try {
    const raw = await fs.readFile(snapshotPath, 'utf8');
    data = JSON.parse(raw);
  } catch {
    throw new Error('FS operation failed');
  }

  try {
    await fs.access(restoreDir);
    throw new Error('FS operation failed');
  } catch (err) {
    if (err.message === 'FS operation failed') throw err;
  }

  await fs.mkdir(restoreDir, { recursive: true });
  const { entries = [] } = data;
  for (const entry of entries) {
    const targetPath = path.join(restoreDir, entry.path);
    if (entry.type === 'directory') {
      await fs.mkdir(targetPath, { recursive: true });
    } else {
      const dir = path.dirname(targetPath);
      await fs.mkdir(dir, { recursive: true });
      const content = Buffer.from(entry.content, 'base64');
      await fs.writeFile(targetPath, content);
    }
  }
};

await restore();
