import fs from 'node:fs/promises';
import path from 'node:path';

const findByExt = async () => {

  const index = process.argv.indexOf('--ext');
  const ext = process.argv[index + 1];
  let extension;

  if (index !== -1) {
    extension = ext.startsWith('.') ? ext : '.' + ext;
  } else {
    extension = '.txt';
  }

  const workspacePath = path.resolve('src/workspace');

  try {
    const stats = await fs.stat(workspacePath);

    if (!stats.isDirectory()) {
      throw new Error('FS operation failed');
    }
    let result = []
    await walk(workspacePath, workspacePath, extension, result);
    
    result.sort();
    for (const file of result) {
      console.log(file);
    }

  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error('FS operation failed');
    }
    throw err;
  }

  async function walk(currentPath, basePath, extension, result) {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const dirent of entries) {

      const fullPath = path.join(currentPath, dirent.name);
      const relativePath = path.relative(basePath, fullPath);

      if (dirent.isDirectory()) {
        await walk(fullPath, basePath, extension, result);

      } else if (dirent.isFile()) {
        if (path.extname(dirent.name) === extension){
          result.push(relativePath)
        }
      }
    } 
  }
};





await findByExt().catch(console.error);