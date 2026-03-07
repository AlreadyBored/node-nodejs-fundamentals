import { readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const findByExt = async () => {
  const args = process.argv;
  const extIndex = args.indexOf('--ext');
  const ext = extIndex !== -1 ? args[extIndex + 1] : 'txt';
  const targetExt = ext.startsWith('.') ? ext : `.${ext}`;

  const workspacePath = join(fileURLToPath(import.meta.url), '..', 'workspace');

  const findFiles = async (dir) => {
    const entries = await readdir(dir, { withFileTypes: true });
    const results = [];

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...await findFiles(fullPath));
      } else if (extname(entry.name) === targetExt) {
        results.push(fullPath);
      }
    }

    return results;
  };

  const files = await findFiles(workspacePath);
  files.forEach((file) => console.log(file));
};

await findByExt();
