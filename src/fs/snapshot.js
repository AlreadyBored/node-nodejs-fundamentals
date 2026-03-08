import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const snapshot = async () => {
  const baseDir = path.join(__dirname, '../../');
  const workspace = path.join(baseDir, 'workspace');
  const snapshotPath = path.join(baseDir, 'snapshot.json');

  try {
    await fs.access(workspace);
  } catch {
    throw new Error('FS operation failed');
  }

  const entries = [];

  async function scan(dir) {
    let dirents;
    try {
      dirents = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      throw new Error('FS operation failed');
    }
    for (const dirent of dirents) {
      const fullPath = path.join(dir, dirent.name);
      const relPath = path.relative(workspace, fullPath);
      if (dirent.isDirectory()) {
        entries.push({
          path: relPath,
          type: 'directory'
        });
        await scan(fullPath);
      } else if (dirent.isFile()) {
        let content, size;
        try {
          const fileBuffer = await fs.readFile(fullPath);
          content = fileBuffer.toString('base64');
          size = fileBuffer.length;
        } catch {
          throw new Error('FS operation failed');
        }
        entries.push({
          path: relPath,
          type: 'file',
          size,
          content
        });
      }
    }
  }

  await scan(workspace);

  const snapshotObj = {
    rootPath: path.resolve(workspace),
    entries
  };

  try {
    await fs.writeFile(snapshotPath, JSON.stringify(snapshotObj, null, 2), 'utf8');
  } catch {
    throw new Error('FS operation failed');
  }
};

await snapshot();