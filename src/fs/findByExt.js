import process from 'process'
import path from 'path';
import fs from "fs/promises"
import { access, stat } from 'fs';

const findByExt = async () => {
  // Write your code here
  // Recursively find all files with specific extension
  // Parse --ext CLI argument (default: .txt)
  if (process.argv.length < 4){
    throw "Some of the arguments missing"
  }

  var workspace = path.join(process.cwd(), 'workspace')

  try{
    await fs.access(workspace)
  }catch{
    throw " FS operation failed"
  }

  var extension = '.txt'
  var filesExpected = []

  const extValue = process.argv.indexOf('--ext') + 1
  
  extension = "." + process.argv[extValue]

  const iterate = async currentDir => {
    for (let i of await fs.readdir(currentDir)){
      const entryPath = path.join(currentDir, i)
      const stats = await fs.stat(entryPath)

      if (await stats.isFile() && extension == await path.extname(entryPath)){
        filesExpected.push(path.relative(workspace, entryPath))
      } else if ((await stats).isDirectory()){
        await iterate(entryPath)
      }
    }

    filesExpected.sort()
  }

  await iterate(workspace)

  for (let l of filesExpected){
    console.log(l)
  }
};

await findByExt();
