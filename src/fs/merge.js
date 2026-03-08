import os from 'os';
import { readdir, readFile, writeFile } from 'node:fs/promises';

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt

  const sep = (os.platform() == 'win32') ? '\\' : '/';
  const workspace = 'workspace' + sep + "parts";
  let files

  try { 
    files = await readdir(workspace, { withFileTypes: true, recursive: true });
  } catch (error) {
    console.log('FS operation failed')
    process.exit(1)
  }

  let filenames = null
  if (process.argv.length > 1) {
    const idx = process.argv.indexOf("--files")
    if (idx > -1 && idx < process.argv.length-1) {
      filenames = process.argv[idx + 1].split(",")
    }
  }

  const contents = []
  const promises = files.filter(f => f.name.endsWith(".txt") && 
            (filenames == null || filenames != null && filenames.indexOf(f.name.replace(".txt", "")) > -1))
       .map( f => readFile(f.parentPath + sep + f.name, {encoding: "utf-8"}).then(d => contents.push([f.name, d])));
       
  await Promise.all(promises);

  // check all found
  if (filenames != null) {
    const filteredNames = contents.map(c => c[0])
    const missedCount = filenames.filter(f => filteredNames.indexOf(f + '.txt') == -1).length
    if (missedCount > 0) {
      console.log('FS operation failed')
      process.exit(1)
    }
  }

  // merge
  let concate = "";
  if (contents.length > 0) {
    contents.sort()
    for (let [_, content] of contents) {
      concate += content
    }
    console.log(concate)
  }
  const mergedFileName = 'workspace' + sep + 'merged.txt'
  await writeFile(mergedFileName, concate, 'utf8')
};

await merge();
