import fs from 'fs/promises';
import path from 'path';

const restore = async () => {
  // Write your code here
  // Read snapshot.json
  // Treat snapshot.rootPath as metadata only
  // Recreate directory/file structure in workspace_restored

  let snapFile;
  try {
    snapFile = await fs.readFile('./src/fs/snapshot.json', 'utf-8');
  } catch {
    throw new Error('FS operation failed');
  }
  const snapParser = JSON.parse(snapFile);
  const rootFolder = './workspace_restored';

  await fs.mkdir(rootFolder);
  for (const item of snapParser.entries) {
    const newObjectPath = path.join(rootFolder, item.path)
    if (item.type == 'directory') {
      await fs.mkdir(newObjectPath);
    } else if (item.type == 'file') {
      const deBuf = Buffer.from(item.content, 'base64');
      await fs.writeFile(newObjectPath, deBuf);
    }
  }
};

await restore();
