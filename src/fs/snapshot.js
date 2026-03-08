import path from 'path';
import fs from 'fs/promises';

const snapshot = async () => {
  const workspacePath = path.resolve(process.cwd(), 'workspace');
  const snapshotPath = path.resolve(process.cwd(), 'snapshot.json');

  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error('FS operation failed');
  }

  const entries = [];
  await scanDir(workspacePath, workspacePath, entries);
  const payload = { rootPath: workspacePath, entries };
  await fs.writeFile(snapshotPath, JSON.stringify(payload, null, 2));
};

async function scanDir(dirPath, basePath, entries) {
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    const relativePath = path.relative(basePath, fullPath);
    if (item.isDirectory()) {
      entries.push({ path: relativePath, type: 'directory' });
      await scanDir(fullPath, basePath, entries);
    } else {
      const content = await fs.readFile(fullPath);
      const size = content.length;
      const contentBase64 = content.toString('base64');
      entries.push({
        path: relativePath,
        type: 'file',
        size,
        content: contentBase64,
      });
    }
  }
}

await snapshot();
