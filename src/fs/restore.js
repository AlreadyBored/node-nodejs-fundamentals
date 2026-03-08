import { readFile, writeFile, mkdir } from 'node:fs/promises';
import os from 'os';

const restore = async () => {
  let sep = (os.platform() == 'win32') ? '\\' : '/';
  let fileName = 'snapshot.json';
  // read content
  let snapshot;
  try {
    snapshot = await readFile(fileName, { encoding: 'utf8' })
  } catch (err) {
    console.log('FS operation failed')
    process.exit(1)
  }

  try {
    snapshot = JSON.parse(snapshot)
  } catch (err) {
    console.log('Json content expected')
    process.exit(1)
  }

  // validate structure
  if (snapshot.rootPath == undefined) {
    console.log('wrong json structure: rootPath is not declared')
    process.exit(1)
  }

  if (snapshot.entries == undefined) {
    console.log('wrong json structure: entries is not declared')
    process.exit(1)
  }

  if (snapshot.entries == undefined || snapshot.entries.length == 0) {
    return
  }

  const basePath = 'workspace_restored'
  try {
    await mkdir(basePath)
  } catch (err) {
    console.log('FS operation failed')
    process.exit(1)
  }

  const promises = snapshot.entries
  .filter(f => f.type == 'directory')
  .map(d => mkdir(basePath + sep + d.path, {recursive: true}))
  await Promise.all(promises);


  const filePromises = snapshot.entries
  .filter(f => f.type == 'file')
  .map(f => writeFile(basePath + sep + f.path, atob(f.content), 'utf8'))
  await Promise.all(filePromises);
};

await restore();
