import fs from 'fs/promises';
import path from 'path';


const restore = async () => {
  // Write your code here
  // Read snapshot.json
  // Treat snapshot.rootPath as metadata only
  // Recreate directory/file structure in workspace_restored
  const workspacePath = process.cwd();
  const snapshotPath = path.join(workspacePath, 'snapshot.json');
  const restoredPath = path.join(workspacePath, 'workspace_restored');

  try {
    await fs.access(snapshotPath);
  } catch {
    throw new Error('FS operation failed');
  }

  try {
    await fs.access(restoredPath);
    throw new Error('FS operation failed');
  } catch (error) {
    if (error.message === 'FS operation failed') {
      throw error;
    }
  }

  try {
    const snapshotRaw = await fs.readFile(snapshotPath, 'utf-8');
    const snapshot = JSON.parse(snapshotRaw);

    await fs.mkdir(restoredPath);

    for (const entry of snapshot.entries) {
      const targetPath = path.join(restoredPath, entry.path);

      if (entry.type === 'directory') {
        await fs.mkdir(targetPath, { recursive: true });
      }

      if (entry.type === 'file') {
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        const content = Buffer.from(entry.content, 'base64');
        await fs.writeFile(targetPath, content);
      }
    }
  } catch {
    throw new Error('FS operation failed');
  }
};

await restore();
