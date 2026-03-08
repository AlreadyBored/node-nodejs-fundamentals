import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const findByExt = async () => {
  const extArgIndex = process.argv.indexOf('--ext');
  let ext = '.txt';
  if (extArgIndex !== -1 && process.argv[extArgIndex + 1]) {
    let rawExt = process.argv[extArgIndex + 1];
    ext = rawExt.startsWith('.') ? rawExt : `.${rawExt}`;
  }

  const workspace = path.join(__dirname, '../../workspace');

  const result = [];
  async function search(dir) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (e) {
      throw new Error('FS operation failed');
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(workspace, fullPath);
      if (entry.isDirectory()) {
        await search(fullPath);
      } else if (entry.isFile() && path.extname(entry.name) === ext) {
        result.push(relPath);
      }
    }
  }

  try {
    await fs.access(workspace);
  } catch (e) {
    throw new Error('FS operation failed');
  }

  await search(workspace);

  result.sort();
  for (const file of result) {
    console.log(file);
  }
};

await findByExt();
