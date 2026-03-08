import { promises as fs } from 'fs';
import { join, relative, resolve } from 'path';

const findByExt = async () => {
  const workspacePath = resolve(process.cwd(), 'workspace');
  let ext = '.txt';

  const extArgIndex = process.argv.indexOf('--ext');
  if (extArgIndex !== -1 && process.argv[extArgIndex + 1]) {
    ext = process.argv[extArgIndex + 1];
    if (!ext.startsWith('.')) ext = '.' + ext;
  }

  try {
    const stats = await fs.stat(workspacePath);
    if (!stats.isDirectory()) {
      throw new Error('FS operation failed');
    }
  } catch (error) {
    throw new Error('FS operation failed');
  }

  const results = [];

  const scan = async (dir) => {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = join(dir, file.name);
      if (file.isDirectory()) {
        await scan(fullPath);
      } else if (file.isFile() && file.name.endsWith(ext)) {
        results.push(relative(workspacePath, fullPath));
      }
    }
  };

  await scan(workspacePath);
  results.sort().forEach((path) => console.log(path));
};

await findByExt();
