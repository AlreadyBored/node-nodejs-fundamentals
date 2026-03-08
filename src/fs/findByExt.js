import fs from 'node:fs/promises';
import path from 'node:path';

const getExt = () => {
  const extArgIndex = process.argv.findIndex((arg) => arg === '--ext');
  if (extArgIndex !== -1 && process.argv[extArgIndex + 1]) {
    let ext = process.argv[extArgIndex + 1];
    if (!ext.startsWith('.')) {
      ext = `.${ext}`;
    }
    return ext;
  }
  return '.txt';
};

const findByExt = async () => {
  const targetExt = getExt();

  // The directory to search in, assuming 'workspace' relative to current working directory
  const rootPath = path.resolve('workspace');

  try {
    const stat = await fs.stat(rootPath);
    if (!stat.isDirectory()) {
      throw new Error('FS operation failed');
    }
  } catch {
    throw new Error('FS operation failed');
  }

  const matchedPaths = [];

  const walk = async (currentPath) => {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
      } else if (entry.isFile()) {
        if (entry.name.endsWith(targetExt)) {
          const relativePath = path.relative(rootPath, absolutePath).split(path.sep).join('/');
          matchedPaths.push(relativePath);
        }
      }
    }
  };

  await walk(rootPath);

  matchedPaths.sort((a, b) => a.localeCompare(b));

  for (const file of matchedPaths) {
    console.log(file);
  }
};

await findByExt();
