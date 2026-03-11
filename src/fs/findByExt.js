import { readdir } from 'node:fs/promises';
import path from 'node:path';

const findByExt = async () => {
  // Write your code here
  // Recursively find all files with specific extension
  // Parse --ext CLI argument (default: .txt)
  const extFlagIndex = process.argv.indexOf('--ext');
  const rawExt = extFlagIndex >= 0 ? process.argv[extFlagIndex + 1] : '.txt';
  const extension = rawExt ? (rawExt.startsWith('.') ? rawExt : `.${rawExt}`) : '.txt';
  const rootDir = process.cwd();
  const matchedFiles = [];

  const scanDirectory = async (currentDir) => {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await scanDirectory(entryPath);
      } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === extension.toLowerCase()) {
        matchedFiles.push(path.relative(rootDir, entryPath).split(path.sep).join('/'));
      }
    }
  };

  try {
    await scanDirectory(rootDir);
    matchedFiles.sort((a, b) => a.localeCompare(b));
    matchedFiles.forEach((filePath) => {
      console.log(filePath);
    });
  } catch {
    throw new Error('FS operation failed');
  }
};

await findByExt();
