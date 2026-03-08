import fs from 'fs/promises';
import path from 'path';

const snapshot = async () => {
  // Write your code here
  // Recursively scan workspace directory
  // Write snapshot.json with:
  // - rootPath: absolute path to workspace
  // - entries: flat array of relative paths and metadata

  const rootPath = '/home/dimazdr/projects/node-nodejs-fundamentals';
  const saveSnapPath = 'src/fs/snapshot.json';
  
  const snapshotData = {
    "rootPath": rootPath,
    "entries": []
  };
  
  // Recursively walk directory tree and collect snapshot entries
  const scan = async (rPath) => {
    const items = await fs.readdir(rPath);
    
    for (const item of items) {
      const fullPath = path.join(rPath, item);
      const relPath = path.relative(rootPath, fullPath);
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        snapshotData.entries.push({
          "path": relPath,
          "type": "directory"
        });
        await scan(fullPath);
      } else if (stats.isFile()) {
        const buf = await fs.readFile(fullPath, 'base64');
        snapshotData.entries.push({ "path": relPath,
          "type": "file",
          "size": stats.size,
          "content": buf
        });
      }
    }
  };
  try {
    await scan(rootPath);
    const jsonWsData = JSON.stringify(snapshotData, null, 2);
    await fs.writeFile(saveSnapPath, jsonWsData);
  } catch {
    throw new Error('FS operation failed'); 
    }
};

await snapshot();
