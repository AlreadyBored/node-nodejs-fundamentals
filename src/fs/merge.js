import { debug } from 'node:console';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);
  const partsDir = path.resolve(currentDir, '../../workspace/parts');
  const targetFile = path.resolve(currentDir, '../../workspace/merged.txt');

  const filesFlagIndex = process.argv.indexOf('--files');
debugger;

  try {
    let filenames;

    if (filesFlagIndex >= 0) {
      const rawList = process.argv[filesFlagIndex + 1] ?? '';
      filenames = rawList
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);

      if (filenames.length === 0) {
        throw new Error('FS operation failed');
      }
    } else {
      const entries = await readdir(partsDir, { withFileTypes: true });
      filenames = entries
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.txt'))
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b));
    }

    const chunks = [];
    for (const filename of filenames) {
      const filePath = path.join(partsDir, filename);
      chunks.push(await readFile(filePath, 'utf8'));
    }
debugger;
    await writeFile(targetFile, chunks.join(''), 'utf8');
  } catch {
    throw new Error('FS operation failed');
  }
};

await merge();
