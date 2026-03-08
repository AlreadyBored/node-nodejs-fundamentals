import fs from 'node:fs/promises';
import path from 'node:path';

const getFilesArg = () => {
  const argIndex = process.argv.findIndex((arg) => arg === '--files');
  if (argIndex !== -1 && process.argv[argIndex + 1]) {
    return process.argv[argIndex + 1].split(',').filter(Boolean);
  }
  return null;
};

const merge = async () => {
  const partsDir = path.resolve('workspace/parts');
  const outFile = path.resolve('workspace/merged.txt');

  try {
    const stat = await fs.stat(partsDir);
    if (!stat.isDirectory()) {
      throw new Error('FS operation failed');
    }
  } catch {
    throw new Error('FS operation failed');
  }

  let filesToMerge = getFilesArg();

  if (!filesToMerge) {
    let entries;
    try {
      entries = await fs.readdir(partsDir, { withFileTypes: true });
    } catch {
      throw new Error('FS operation failed');
    }

    filesToMerge = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.txt'))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    if (filesToMerge.length === 0) {
      throw new Error('FS operation failed');
    }
  } else if (filesToMerge.length === 0) {
    throw new Error('FS operation failed');
  }

  let mergedContent = '';

  for (const fileName of filesToMerge) {
    const filePath = path.join(partsDir, fileName);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      mergedContent += content;
    } catch {
      throw new Error('FS operation failed');
    }
  }

  try {
    await fs.mkdir(path.dirname(outFile), { recursive: true });
    await fs.writeFile(outFile, mergedContent);
  } catch {
    throw new Error('FS operation failed');
  }
};

await merge();
