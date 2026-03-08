import fs from 'node:fs/promises';
import path from 'node:path';

const toRelativePath = (rootPath, targetPath) =>
  path.relative(rootPath, targetPath).split(path.sep).join('/');

const getCliPath = () => {
  const pathArgIndex = process.argv.findIndex((arg) => arg === '--path');

  if (pathArgIndex !== -1 && process.argv[pathArgIndex + 1]) {
    return process.argv[pathArgIndex + 1];
  }

  if (process.argv[2] && process.argv[2] !== '--path') {
    return process.argv[2];
  }

  return 'workspace';
};

const snapshot = async () => {
  const sourcePath = getCliPath();
  const workspacePath = path.resolve(sourcePath);
  const snapshotPath = path.join(path.dirname(workspacePath), 'snapshot.json');

  let workspaceStat;
  try {
    workspaceStat = await fs.stat(workspacePath);
  } catch {
    throw new Error('FS operation failed');
  }

  if (!workspaceStat.isDirectory()) {
    throw new Error('FS operation failed');
  }

  const entries = [];

  const walk = async (currentPath) => {
    let dirEntries;
    try {
      dirEntries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch {
      return;
    }
    dirEntries.sort((a, b) => a.name.localeCompare(b.name));

    for (const dirEntry of dirEntries) {
      const absoluteEntryPath = path.join(currentPath, dirEntry.name);
      const relativeEntryPath = toRelativePath(workspacePath, absoluteEntryPath);

      if (dirEntry.isDirectory()) {
        entries.push({ path: relativeEntryPath, type: 'directory' });
        await walk(absoluteEntryPath);
        continue;
      }

      if (dirEntry.isFile()) {
        try {
          const [fileStat, fileBuffer] = await Promise.all([
            fs.stat(absoluteEntryPath),
            fs.readFile(absoluteEntryPath),
          ]);

          entries.push({
            path: relativeEntryPath,
            type: 'file',
            size: fileStat.size,
            content: fileBuffer.toString('base64'),
          });
        } catch {
          // Ignore files that cannot be read
        }
      }
    }
  };

  await walk(workspacePath);

  await fs.writeFile(
    snapshotPath,
    JSON.stringify(
      {
        rootPath: workspacePath,
        entries,
      },
      null,
      2,
    ),
  );
};

await snapshot();
