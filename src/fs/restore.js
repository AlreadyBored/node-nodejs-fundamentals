import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const restore = async () => {
  // Write your code here
  // Read snapshot.json
  // Treat snapshot.rootPath as metadata only
  // Recreate directory/file structure in workspace_restored

  const snapshotPath = path.join(currentDir, 'snapshot.json');
  const restorePath = path.join(currentDir, 'workspace_restored');

  try {
    await fsPromises.access(snapshotPath);
  } catch {
    throw new Error('FS operation failed');
  }

  try {
    // console.log(restorePath);
    await fsPromises.access(restorePath);
    throw new Error('FS operation failed');
  } catch (err) {
    if (err.message.includes('no such file or directory')) {
    } else {
      throw err;
    }
  }

  const contents = await fsPromises.readFile(snapshotPath, 'utf8');
  const { entries } = JSON.parse(contents);

  await fsPromises.mkdir(restorePath, { recursive: true });

  for (let i = 0; i < entries.length; i += 1) {
    const item = entries[i];
    const entryPath = path.join(restorePath, item.path);

    if (item.type === 'directory') {
      await fsPromises.mkdir(entryPath, { recursive: true });
    } else {
      await fsPromises.mkdir(path.dirname(entryPath), { recursive: true });

      await fsPromises.writeFile(entryPath, Buffer.from(item.content, 'base64'));
    }
  }
};

await restore();
