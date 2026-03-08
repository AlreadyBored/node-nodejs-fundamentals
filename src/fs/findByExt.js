import fs from 'fs/promises';
import path from 'path';

const findByExt = async () => {
  // Write your code here
  // Recursively find all files with specific extension
  // Parse --ext CLI argument (default: .txt)
  
  const rootPath = '/home/dimazdr/projects/node-nodejs-fundamentals';
  const specExt = [];
  const args = process.argv.slice(2);
  let ext = '.txt';
  const extIndex = args.indexOf('--ext');
  
  if (extIndex !== -1 && args[extIndex + 1]) {
    ext = args[extIndex + 1];
    if (!ext.startsWith('.')) ext = '.' + ext;
  }

  const scan = async (rPath) => {
    const items = await fs.readdir(rPath, {withFileTypes: true});
    for (const item of items) {
      const fullPath = path.join(rPath, item.name);
      const relPath = path.relative(rootPath, fullPath);  
      if (item.isDirectory()) {
        await scan(fullPath);
      } else if (item.isFile()) {
        if (path.extname(item.name) === ext) {
          specExt.push(relPath);
        }
      }
    }
  }
  try {
    await scan(rootPath);
    const alphSorted = specExt.sort();
    console.log(alphSorted);
  } catch {
    throw new Error('FS operation failed');
  }
};

await findByExt();
