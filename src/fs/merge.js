import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const merge = async () => {
  const workspace = path.join(__dirname, '../../workspace');
  const partsDir = path.join(workspace, 'parts');
  const mergedFile = path.join(workspace, 'merged.txt');

  const filesArgIndex = process.argv.indexOf('--files');
  let filesToMerge = null;
  if (filesArgIndex !== -1 && process.argv[filesArgIndex + 1]) {
    filesToMerge = process.argv[filesArgIndex + 1].split(',').map(f => f.trim());
  }

  try {
    await fs.access(partsDir);
  } catch (e) {
    console.error(e); 
    throw new Error('FS operation failed');
  }

  let files;
  if (filesToMerge) {
    files = filesToMerge;
    for (const file of files) {
      const filePath = path.join(partsDir, file);
      try {
        await fs.access(filePath);
      } catch (e) {
        throw new Error('FS operation failed');
      }
    }
  } else {  
    let entries;
    try {
      entries = await fs.readdir(partsDir, { withFileTypes: true });
    } catch (e) {
      throw new Error('FS operation failed');
    }
    files = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.txt'))
      .map(entry => entry.name)
      .sort();
    if (files.length === 0) {
      throw new Error('FS operation failed');
    }
  }

  let mergedContent = '';
  for (const file of files) {
    const filePath = path.join(partsDir, file);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      mergedContent += content;
    } catch (e) {
      throw new Error('FS operation failed');
    }
  }

  try {
    await fs.writeFile(mergedFile, mergedContent, 'utf8');
  } catch (e) {
    throw new Error('FS operation failed');
  }
};

await merge();
