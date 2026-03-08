import fs from 'fs/promises';
import path from 'path';

const SNAPSHOT = path.join(process.cwd(), 'snapshot.json');
const RESTORE_DIR = path.join(process.cwd(), 'workspace_restored');

const restore = async () => {
  // Check if snapshot.json exists
  let snapshot;
  try {
    const data = await fs.readFile(SNAPSHOT, 'utf-8');
    snapshot = JSON.parse(data);
  } catch (e) {
    throw new Error('FS operation failed');
  }

  // Check if workspace_restored already exists
  try {
    await fs.access(RESTORE_DIR);
    // If no error, directory exists
    throw new Error('FS operation failed');
  } catch (e) {
    if (e.code !== 'ENOENT') throw new Error('FS operation failed');
    // else, directory does not exist, continue
  }

  // Create workspace_restored
  await fs.mkdir(RESTORE_DIR);

  // Recreate structure
  for (const entry of snapshot.entries) {
    const dest = path.join(RESTORE_DIR, entry.path);
    if (entry.type === 'directory') {
      await fs.mkdir(dest, { recursive: true });
    } else if (entry.type === 'file') {
      await fs.mkdir(path.dirname(dest), { recursive: true });
      const content = Buffer.from(entry.content, 'base64');
      await fs.writeFile(dest, content);
    }
  }
};

await restore();
