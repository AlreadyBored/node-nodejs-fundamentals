import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { readdir, readFile, lstat, writeFile } from 'node:fs/promises';

const snapshot = async () => {
  const getDirEntries = async (path) => {
    const childElements = await readdir(path, { withFileTypes: true });
    const dirEntries = [];

    for (const element of childElements) {
      const entry = { path: element.name };
      const fullPath = join(path, entry.path);

      if (element.isFile()) {
        const stats = await lstat(fullPath);

        entry.type = 'file';
        entry.size = stats.size;
        entry.content = (await readFile(fullPath)).toString('base64');
        
        dirEntries.push(entry);
        continue;
      }

      entry.type = 'directory';

      const subDirEntries = await getDirEntries(fullPath);

      dirEntries.push([
        entry,
        subDirEntries.map(element => ({
          ...element,
          path: join(entry.path, element.path),
        })),
      ]);
    }

    return dirEntries;
  };

  try {
    const rootPath = join(fileURLToPath(import.meta.url), '..', '..', '..', 'workspace');
    const entries = await getDirEntries(rootPath);

    await writeFile(
      join(rootPath, '..', 'snapshot.json'),
      JSON.stringify({ rootPath, entries: entries.flat(Infinity) }, null, 2)
    );
  } catch (error) {
    error.message = `FS operation failed\n${error.message}`;
    throw error;
  }
};

await snapshot();
