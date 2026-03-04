import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
const snapshot = async () => {
  // Write your code here
  // Recursively scan workspace directory
  // Write snapshot.json with:
  // - rootPath: absolute path to workspace
  // - entries: flat array of relative paths and metadata
  const rootPath = `${process.cwd()}/workspace`;
  const snapshot = {
    rootPath,
    entries: []
  };
  try {
    const readDir = await readdir(rootPath, { withFileTypes: true, recursive: true });
    for (const entry of readDir) {
      const fullEntryPath = entry.parentPath + '/' + entry.name;
      const entryPath = fullEntryPath.replace(rootPath + '/', '');
      snapshot.entries.push({
        path: entryPath,
        type: entry.isDirectory() ? 'directory' : 'file',
        size: entry.isDirectory() ? undefined : (await stat(fullEntryPath)).size,
        content: entry.isDirectory() ? undefined : await base64Encode(fullEntryPath)
      });
    }
  }
  catch (err) {
    console.error("Error scanning workspace directory:", err);
    throw new Error("FS operation failed")
  }
  await writeFile('snapshot.json', JSON.stringify(snapshot, null, 2));
};

/*
* Read file content and return base64 encoded string
*/
const base64Encode = async (filePath) => {
  const content = await readFile(filePath);
  return content.toString('base64');
}

await snapshot();
