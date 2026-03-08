import fs from 'fs/promises';
import path from 'path';

const PARTS_DIR = path.join(process.cwd(), 'workspace', 'parts');
const MERGED_FILE = path.join(process.cwd(), 'workspace', 'merged.txt');

const parseFilesArg = () => {
  const idx = process.argv.indexOf('--files');
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1].split(',').map(f => f.trim()).filter(Boolean);
  }
  return null;
};

const merge = async () => {
  let filesToMerge;
  try {
    const filesArg = parseFilesArg();
    if (filesArg) {
      // --files mode
      filesToMerge = filesArg.map(f => path.join(PARTS_DIR, f));
      // Check all files exist
      await Promise.all(filesToMerge.map(async file => {
        try {
          await fs.access(file);
        } catch {
          throw new Error('FS operation failed');
        }
      }));
    } else {
      // Default mode: all .txt files in parts, sorted
      let entries;
      try {
        entries = await fs.readdir(PARTS_DIR, { withFileTypes: true });
      } catch {
        throw new Error('FS operation failed');
      }
      filesToMerge = entries
        .filter(e => e.isFile() && e.name.endsWith('.txt'))
        .map(e => path.join(PARTS_DIR, e.name))
        .sort();
      if (filesToMerge.length === 0) throw new Error('FS operation failed');
    }
    // Read and concatenate
    const contents = await Promise.all(filesToMerge.map(f => fs.readFile(f, 'utf-8')));
    await fs.mkdir(path.dirname(MERGED_FILE), { recursive: true });
    await fs.writeFile(MERGED_FILE, contents.join(''));
  } catch (e) {
    throw new Error('FS operation failed');
  }
};

await merge();