import fs from 'fs/promises';
import path from 'path';

const WORKSPACE = process.cwd();

function parseExtArg() {
  const extIndex = process.argv.indexOf('--ext');
  let ext = '.txt';
  if (extIndex !== -1 && process.argv[extIndex + 1]) {
    ext = process.argv[extIndex + 1];
    if (!ext.startsWith('.')) ext = '.' + ext;
  }
  return ext;
}

async function* walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (e) {
    throw new Error('FS operation failed');
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

const findByExt = async () => {
  const ext = parseExtArg();
  let files = [];
  try {
    for await (const file of walk(WORKSPACE)) {
      if (path.extname(file) === ext) {
        files.push(path.relative(WORKSPACE, file));
      }
    }
  } catch (e) {
    throw new Error('FS operation failed');
  }
  files.sort();
  for (const f of files) {
    console.log(f);
  }
};

await findByExt();
