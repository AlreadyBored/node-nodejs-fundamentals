import path from 'path';
import fs from 'fs/promises';

function getExtSuffixFromArgs() {
  const argv = process.argv.slice(2);
  const i = argv.indexOf('--ext');
  if (i === -1 || i === argv.length - 1) return '.txt';
  const value = argv[i + 1];
  return value.startsWith('.') ? value : `.${value}`;
}

const findByExt = async () => {
  const suffix = getExtSuffixFromArgs();
  const workspacePath = path.resolve(process.cwd(), 'workspace');

  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error('FS operation failed');
  }

  const files = [];
  await collectFilesByExt(workspacePath, workspacePath, suffix, files);
  files.sort();
  for (const rel of files) {
    console.log(rel);
  }
};

async function collectFilesByExt(dirPath, basePath, suffix, out) {
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    const relativePath = path.relative(basePath, fullPath);
    if (item.isDirectory()) {
      await collectFilesByExt(fullPath, basePath, suffix, out);
    } else if (relativePath.endsWith(suffix)) {
      out.push(relativePath);
    }
  }
}

await findByExt();
