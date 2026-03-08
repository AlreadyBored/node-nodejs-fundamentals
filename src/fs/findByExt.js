import os from 'os';
import { readdir } from 'node:fs/promises';

const findByExt = async () => {
  // Write your code here
  // Recursively find all files with specific extension
  // Parse --ext CLI argument (default: .txt)
  let ext = ".txt"
  if (process.argv.length > 1) {
    const idx = process.argv.indexOf("--ext")
    if (idx > -1 && idx < process.argv.length-1) {
      ext = process.argv[idx + 1]
    }
  }

  const sep = (os.platform() == 'win32') ? '\\' : '/';
  let files

  try { 
    files = await readdir('workspace', { withFileTypes: true, recursive: true });
  } catch (error) {
    console.log('FS operation failed')
    process.exit(1)
  }

  let filteredFiles = files.filter(f => f.isFile() && f.name.endsWith(ext)).map(f => f.parentPath + sep + f.name)
  filteredFiles.sort()
  for (let fileName of filteredFiles) {
    console.log(fileName)
  }
};


await findByExt();
