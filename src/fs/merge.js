import path from 'path';
import fs from 'fs/promises';

function getFilesArg() {
  const argv = process.argv.slice(2);
  const i = argv.indexOf('--files');
  if (i === -1 || i === argv.length - 1) return null;
  return argv[i + 1].split(',').map((s) => s.trim()).filter(Boolean);
}

const merge = async () => {
  const workspacePath = path.resolve(process.cwd(), 'workspace');
  const partsPath = path.join(workspacePath, 'parts');
  const mergedPath = path.join(workspacePath, 'merged.txt');

  try {
    await fs.access(partsPath);
  } catch {
    throw new Error('FS operation failed');
  }

  let fileNames;
  const filesArg = getFilesArg();
  if (filesArg && filesArg.length > 0) {
    fileNames = filesArg;
    for (const name of fileNames) {
      const filePath = path.join(partsPath, name);
      try {
        await fs.access(filePath);
      } catch {
        throw new Error('FS operation failed');
      }
    }
  } else {
    const entries = await fs.readdir(partsPath, { withFileTypes: true });
    fileNames = entries
      .filter((e) => e.isFile() && e.name.endsWith('.txt'))
      .map((e) => e.name)
      .sort();
    if (fileNames.length === 0) throw new Error('FS operation failed');
  }

  const chunks = [];
  for (const name of fileNames) {
    const filePath = path.join(partsPath, name);
    const content = await fs.readFile(filePath, 'utf8');
    chunks.push(content);
  }
  const merged = chunks.join('\n');
  await fs.writeFile(mergedPath, merged);
};

await merge();
