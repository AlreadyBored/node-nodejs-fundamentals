import { promises as fs } from 'fs';
import { join, resolve, dirname } from 'path';

const restore = async () => {
  const snapshotPath = resolve(process.cwd(), 'snapshot.json');
  const restorePath = resolve(process.cwd(), 'workspace_restored');

  try {
    await fs.access(snapshotPath);
  } catch (error) {
    throw new Error('FS operation failed');
  }

  try {
    const stats = await fs.stat(restorePath);
    if (stats) {
      throw new Error('FS operation failed');
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error('FS operation failed');
    }
  }

  const snapshotData = JSON.parse(await fs.readFile(snapshotPath, 'utf8'));
  const { entries } = snapshotData;

  await fs.mkdir(restorePath, { recursive: true });

  for (const entry of entries) {
    const targetPath = join(restorePath, entry.path);
    if (entry.type === 'directory') {
      await fs.mkdir(targetPath, { recursive: true });
    } else if (entry.type === 'file') {
      await fs.mkdir(dirname(targetPath), { recursive: true });
      const content = Buffer.from(entry.content, 'base64');
      await fs.writeFile(targetPath, content);
    }
  }
};

await restore();
