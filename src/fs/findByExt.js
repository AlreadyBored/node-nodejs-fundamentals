import fs from 'fs/promises';
import path from 'path';

const findByExt = async () => {
  // Write your code here
  // Recursively find all files with specific extension
  // Parse --ext CLI argument (default: .txt)
  const workspacePath = path.join(process.cwd());
  const args = process.argv.slice(2);

  let ext = '.txt';
  const extIndex = args.indexOf('--ext');

  if (extIndex !== -1 && args[extIndex + 1]) {
    ext = args[extIndex + 1].startsWith('.')
      ? args[extIndex + 1]
      : `.${args[extIndex + 1]}`;
  }

  const result = [];

  const scan = async (currentPath) => {
    const items = await fs.readdir(currentPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);

      if (item.isDirectory()) {
        await scan(fullPath);
      } else if (item.isFile() && path.extname(item.name) === ext) {
        result.push(path.relative(workspacePath, fullPath));
      }
    }
  };

  try {
    await fs.access(workspacePath);
    await scan(workspacePath);

    result.sort();

    for (const filePath of result) {
      console.log(filePath);
    }
  } catch {
    throw new Error('FS operation failed');
  }
};

await findByExt();
