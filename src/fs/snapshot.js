import { resolve, join } from 'node:path';
import { readdir, readFile, lstat } from 'node:fs/promises';

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
        entryInfo.content = await readFile(fullPath, 'utf-8');
        
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

  const rootPath = resolve('workspace');
  const entries = await getDirEntries(rootPath);

  console.log({ rootPath, entries: entries.flat(Infinity) });
};

await snapshot();
