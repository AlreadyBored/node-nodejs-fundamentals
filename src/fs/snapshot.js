import fs from 'fs/promises';
import path from 'path';

const WORKSPACE = path.join(process.cwd(), 'workspace');
const SNAPSHOT = path.join(process.cwd(), 'snapshot.json');

async function* walk(dir, base) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    throw new Error('FS operation failed');
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(base, fullPath).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      yield { path: relPath, type: 'directory' };
      yield* walk(fullPath, base);
    } else if (entry.isFile()) {
      const stat = await fs.stat(fullPath);
      const content = await fs.readFile(fullPath);
      yield {
        path: relPath,
        type: 'file',
        size: stat.size,
        content: content.toString('base64')
      };
    }
  }
}

const snapshot = async () => {
  // Check if workspace exists
  try {
    await fs.access(WORKSPACE);
  } catch {
    throw new Error('FS operation failed');
  }
  const entries = [];
  for await (const entry of walk(WORKSPACE, WORKSPACE)) {
    entries.push(entry);
  }
  const data = {
    rootPath: WORKSPACE,
    entries
  };
  await fs.writeFile(SNAPSHOT, JSON.stringify(data, null, 2));
};

await snapshot();