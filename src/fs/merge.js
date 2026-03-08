import fs from 'node:fs/promises';
import path from 'node:path';

const merge = async () => {

const index = process.argv.indexOf('--files')

let files;
if (index !== -1) {
  files = process.argv[index + 1].split(',');
}

const workspacePath = path.resolve('src/workspace/parts');

try{
  const stats = await fs.stat(workspacePath);

  if (!stats.isDirectory()) {
    throw new Error('FS operation failed');
  }
   if(!files){
     const entries = await fs.readdir(workspacePath, { withFileTypes: true });

    files = [];
     for (const dirent of entries) {
        if(dirent.isFile() && path.extname(dirent.name) === '.txt'){
        files.push(dirent.name)
        }
     }
    files.sort()

    if(files.length === 0){
      throw new Error('FS operation failed');
    }
 } else {
    if(files.length === 0 || (files.length === 1 && files[0] === '')){
      throw new Error('FS operation failed');
    }
    for (const file of files){
      try {
        await fs.access(path.join(workspacePath, file));
      } catch {
        throw new Error('FS operation failed');
      }
    }
 }
    let mergedContent = ''
    for (const file of files){
       const content = await fs.readFile(path.join(workspacePath, file), 'utf8')
       mergedContent += content
    }
    await fs.writeFile(path.resolve('src/workspace', 'merged.txt'), mergedContent)
 

} catch (err) {
      if (err.code === 'ENOENT') {
      throw new Error('FS operation failed');
    }
    throw err;
}

};

await merge().catch(console.error);