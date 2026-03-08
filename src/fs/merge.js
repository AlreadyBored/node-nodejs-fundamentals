import { readdir, readFile, writeFile } from 'fs/promises';
import { dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';
import { argv } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const parseFilesArg = () => {
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--files' && args[i + 1]) {
      return args[i + 1].split(',').map(f => f.trim());
    }
  }
  return null;
};

const merge = async () => {
  const workspacePath = join(__dirname, '..', 'workspace');
  const partsPath = join(workspacePath, 'parts');
  const outputPath = join(workspacePath, 'merged.txt');
  
  let filesToMerge;

  const filesArg = parseFilesArg();
  if (filesArg) {
    filesToMerge = filesArg;
  } else {
    try {
      const entries = await readdir(partsPath, { withFileTypes: true });
      filesToMerge = entries
        .filter(entry => entry.isFile() && extname(entry.name) === '.txt')
        .map(entry => entry.name)
        .sort();
    } catch (error) {
      throw new Error('FS operation failed');
    }
  }

  const contents = [];
  for (const filename of filesToMerge) {
    const filePath = join(partsPath, filename);
    try {
      const content = await readFile(filePath, 'utf-8');
      contents.push(content);
    } catch (error) {
      throw new Error('FS operation failed');
    }
  }

  try {
    await writeFile(outputPath, contents.join(''));
  } catch (error) {
    throw new Error('FS operation failed');
  }
};

await merge();
