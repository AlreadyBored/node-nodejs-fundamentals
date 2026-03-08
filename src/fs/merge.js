import { promises as fs } from 'fs';
import { join, resolve } from 'path';

const merge = async () => {
  const partsPath = resolve(process.cwd(), 'workspace', 'parts');
  const outputPath = resolve(process.cwd(), 'workspace', 'merged.txt');

  try {
    const stats = await fs.stat(partsPath);
    if (!stats.isDirectory()) {
      throw new Error('FS operation failed');
    }
  } catch (error) {
    throw new Error('FS operation failed');
  }

  let filesToMerge = [];
  const filesArgIndex = process.argv.indexOf('--files');

  if (filesArgIndex !== -1 && process.argv[filesArgIndex + 1]) {
    filesToMerge = process.argv[filesArgIndex + 1].split(',');
  } else {
    filesToMerge = (await fs.readdir(partsPath))
      .filter((file) => file.endsWith('.txt'))
      .sort();
  }

  if (filesToMerge.length === 0) {
    throw new Error('FS operation failed');
  }

  let mergedContent = '';
  for (const filename of filesToMerge) {
    const filePath = join(partsPath, filename);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      mergedContent += content;
    } catch (error) {
      throw new Error('FS operation failed');
    }
  }

  await fs.writeFile(outputPath, mergedContent);
};

await merge();
