import { stat, readdir, writeFile, readFile } from 'node:fs/promises'
import { resolve, join, relative } from 'node:path'
import {exist} from '../shared/utils/index.js'

const fileName = "snapshot.json"
const directoryName = "workspace"
const errorMessage = 'FS operation failed'

const snapshot = async () => {
  const result = {
    rootPath: null,
    entries: []
  };

  const rootPath = resolve(directoryName)

  try {
    const isExist = await exist(rootPath, 'directory')

    if (!isExist) {
      throw new Error(errorMessage)
    }

    result['rootPath'] = rootPath
    await readDir(rootPath, rootPath, result.entries)

    const pathSnapshot = resolve(fileName)
    const fileContent = JSON.stringify(result, null, 2)
    await writeFile(pathSnapshot, fileContent)
    console.log(fileName + ' has been success written')

  } catch  {
    throw new Error(errorMessage)
  }
};

const readDir = async(rootPath, dirPath, entries) => {
  const items = await readdir(dirPath)

  for(const item of items) {
    const itemPath = join(dirPath, item)
    const relativePath = relative(rootPath, itemPath)

    const elem = await stat(itemPath)

    if (elem.isDirectory()) {
      const entry = {
        path: relativePath,
        type: "directory"
      }

      entries.push(entry)
      await readDir(rootPath, itemPath, entries)
    } else {
      const buffer = await readFile(itemPath)
      const content = buffer.toString('base64')
      const size = elem.size

      const entry = {
        path: relativePath,
        type: 'file',
        size: size,
        content:content 
      }
      
      entries.push(entry)
    }
  }
}

await snapshot();
