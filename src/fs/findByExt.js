import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const findByExt = async () => {
  const workspace = join(process.cwd(), 'workspace');

  let ext = '.txt';
  const extIdx = process.argv.indexOf('--ext');
  if (extIdx !== -1 && process.argv[extIdx + 1]) {
    ext = process.argv[extIdx + 1].startsWith('.')
      ? process.argv[extIdx + 1]
      : `.${process.argv[extIdx + 1]}`;
  }

  const found = [];

  const scan = async (dirPath, relBase = '') => {
    let items;
    try {
      items = await readdir(dirPath, { withFileTypes: true });
    } catch {
      throw new Error('FS operation failed');
    }

    for (const item of items) {
      const fullPath = join(dirPath, item.name);
      const relPath = relBase ? `${relBase}/${item.name}` : item.name;

      if (item.isDirectory()) {
        await scan(fullPath, relPath);
      } else if (item.name.endsWith(ext)) {
        found.push(relPath);
      }
    }
  };

  try {
    await stat(workspace);
  } catch {
    throw new Error('FS operation failed');
  }

  await scan(workspace);
  found.sort();
  found.forEach((p) => console.log(p));
};

await findByExt();
