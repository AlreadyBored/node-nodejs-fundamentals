import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { readdir, readFile, lstat, writeFile } from 'node:fs/promises';

const snapshot = async () => {
  const getDirEntries = async (path) => {
    const dirEntries = await readdir(path, { withFileTypes: true });

    return await Promise.all(dirEntries.map(async entry => {
      const entryInfo = { path: entry.name };
      const fullPath = join(path, entryInfo.path);

      if (entry.isFile()) {
        const stats = await lstat(fullPath);

        entryInfo.type = 'file';
        entryInfo.size = stats.size;
        entryInfo.content = (await readFile(fullPath)).toString('base64');
        
        return entryInfo;
      }

      entryInfo.type = 'directory';

      const subDirEntries = await getDirEntries(fullPath);

      return [
        entryInfo,
        subDirEntries.flatMap(element => ({
          ...element,
          path: join(entryInfo.path, element.path),
        })),
        ];
    }));
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
