import fs from 'fs/promises';
import path from 'path'

const restore = async () => {
  try {
    const snapshotJSON = (await fs.readFile(path.join(process.cwd(), 'snapshot.json'))).toString();
    const snapshot = JSON.parse(snapshotJSON);

    const restoredPath = path.join(process.cwd(), 'workspace_restored');
    await fs.mkdir(restoredPath);

    const dirs = snapshot.entries.filter(e => e.type === 'directory');
    const files = snapshot.entries.filter(e => e.type === 'file');

    await Promise.all(dirs.map(entry => fs.mkdir(path.join(restoredPath, entry.path), { recursive: true })));
    await Promise.all(files.map(entry => {
      const buffer = Buffer.from(entry.content, 'base64');
      const content = buffer.toString('utf-8');
      return fs.writeFile(path.join(restoredPath, entry.path), content);
    }));
  } catch {
    throw new Error('FS operation failed');
  }
};

await restore();
