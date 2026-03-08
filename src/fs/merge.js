import { readdir, readFile, writeFile, stat, access } from 'fs/promises';
import { join } from 'path';

const merge = async () => {
  const partsDir = join(process.cwd(), 'workspace', 'parts');
  const outputPath = join(process.cwd(), 'workspace', 'merged.txt');

  let filesToMerge = [];

  const filesIdx = process.argv.indexOf('--files');
  if (filesIdx !== -1 && process.argv[filesIdx + 1]) {
    filesToMerge = process.argv[filesIdx + 1].split(',').map((f) => f.trim());
  } else {
    let items;
    try {
      items = await readdir(partsDir);
    } catch {
      throw new Error('FS operation failed');
    }
    filesToMerge = items
      .filter((f) => f.endsWith('.txt'))
      .sort((a, b) => a.localeCompare(b));
  }

  if (filesToMerge.length === 0) {
    throw new Error('FS operation failed');
  }

  const contents = [];
  for (const filename of filesToMerge) {
    const filePath = join(partsDir, filename);
    try {
      const content = await readFile(filePath, 'utf-8');
      contents.push(content);
    } catch {
      throw new Error('FS operation failed');
    }
  }

  await writeFile(outputPath, contents.join(''));
};

await merge();
