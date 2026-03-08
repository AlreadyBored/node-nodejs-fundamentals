import fs from 'node:fs/promises';
import path from 'node:path';

const snapshot = async () => {
  const workspacePath = path.resolve('src/workspace');

  try {
    const stats = await fs.stat(workspacePath)

    if(!stats.isDirectory()){
      throw new Error('FS operation failed');
    }

    let result = []

    await walk(workspacePath, workspacePath, result)
    async function walk(currentPath, basePath, result) {
  
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const dirent of entries){
      const fullPath = path.join(currentPath, dirent.name);
      const relativePath = path.relative(basePath, fullPath);
      const normalizedPath = relativePath.split(path.sep).join('/');

      if(dirent.isDirectory()){
        result.push(       
        { path: normalizedPath, type: 'directory' })
        await walk(fullPath, basePath, result);
      }

      else if (dirent.isFile()) {
        const fileStats = await fs.stat(fullPath)
        const content = await fs.readFile(fullPath)
        const base64 = content.toString('base64');
        result.push(
          {
            path: normalizedPath,
            type: 'file',
            size: fileStats.size,
            content: base64
          }
        )
      }
    } 
}

  const snapshotData = {
    rootPath: workspacePath,
    entries: result
  };

  const snapshotPath = path.join(path.dirname(workspacePath), 'snapshot.json');
  await fs.writeFile(snapshotPath, JSON.stringify(snapshotData, null, 2));

  } 
  catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error('FS operation failed');
  }
    throw err;
  }

}

snapshot().catch(console.error);
