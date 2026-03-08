import { readdir, readFile, writeFile } from 'node:fs/promises';
import os from 'os';

const snapshot = async () => {
  // Write your code here
  // Recursively scan workspace directory
  // Write snapshot.json with:
  // - rootPath: absolute path to workspace
  // - entries: flat array of relative paths and metadata
  // Check if the file is readable.

  const userHomeDir = os.homedir();
  let sep = (os.platform() == 'win32') ? '\\' : '/';
  let workspace = 'workspace';

  let files
  try {
    files = await readdir(workspace, { withFileTypes: true, recursive: true });
  } catch (error) {
    console.log('FS operation failed')
    process.exit(1)
  }

  var fileContents = []
  var promises = []

  for (const file of files) {

    let relativePath = file.parentPath + sep + file.name
    const relativeFilePath =  relativePath.replace(workspace + sep, '')
    // console.log(file);
    if (file.isDirectory()) {
      fileContents.push({ path: relativeFilePath, type: 'directory' })
    } else {
      const promise = readFile(relativePath)
          .then(data => {
            fileContents.push({path: relativeFilePath, type: 'file', size: data.length, content: Buffer.from(data).toString('base64')})
        })
      promises.push(promise)
    }
  }
  await Promise.all(promises);
  // prepare final object
  let shapshotContent = JSON.stringify({ rootPath: process.cwd() + sep + workspace, entries: fileContents })
  await writeFile('snapshot.json', shapshotContent, 'utf8');
};

await snapshot();
