import { readdir, stat } from 'fs/promises';
import { dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';
import { argv } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const parseExtArg = () => {
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ext' && args[i + 1]) {
      return args[i + 1].startsWith('.') ? args[i + 1] : `.${args[i + 1]}`;
    }
  }
  return '.txt'; // Default
};

const findFilesByExtension = async (dir, ext, relativeBase) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relPath = join(relativeBase, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await findFilesByExtension(fullPath, ext, relPath);
      files.push(...subFiles);
    } else if (extname(entry.name) === ext) {
      files.push(relPath);
    }
  }

  return files;
};

const findByExt = async () => {
  const ext = parseExtArg();
  const workspacePath = join(__dirname, '..', 'workspace');

  try {
    const files = await findFilesByExtension(workspacePath, ext, '');
    const sortedFiles = files.sort();
    
    for (const file of sortedFiles) {
      console.log(file);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('FS operation failed');
    }
    throw error;
  }
};

await findByExt();
