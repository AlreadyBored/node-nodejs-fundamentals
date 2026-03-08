import fs from 'node:fs/promises';
import path from 'node:path';


const restore = async () => {
  const snapshotPath = path.resolve('src/snapshot.json');
  const workspaceRestoredPath = path.resolve('src/workspace_restored');

  try{
    await fs.stat(snapshotPath);
    }

   catch(err){
      if (err.code === 'ENOENT') {
      throw new Error('FS operation failed');
  }
  throw err;
  };

  try {
    await fs.stat(workspaceRestoredPath);
    throw new Error('FS operation failed');
  } catch (err) {
    if (err.code === 'ENOENT') {
    await fs.mkdir(workspaceRestoredPath);
    } else {
      throw err;
    }
  }

  const data = await fs.readFile(snapshotPath);
  const snapshot = JSON.parse(data);

    for(const entry of snapshot.entries){
      if(entry.type === 'directory'){
        await fs.mkdir(path.join(workspaceRestoredPath, entry.path), { recursive: true });
      }
      else if (entry.type === 'file'){
        const targetPath = path.join(workspaceRestoredPath, entry.path);
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        const buffer = Buffer.from(entry.content, 'base64');
        await fs.writeFile(targetPath, buffer);
      }
    }
}

restore().catch(console.error);



