import { readdir, stat } from 'node:fs/promises'
import { resolve, relative, extname } from 'node:path'
import { argv } from 'node:process'
import { exist } from '../shared/utils/index.js'

const directoryName = "workspace"
const errorMessage = 'FS operation failed'
const defaultExtension = 'txt'

const findByExt = async () => {
  try {
    const index = argv.indexOf('--ext')
    let extension = index !== -1 && argv[index + 1] ? argv[index + 1] : defaultExtension

    const directoryPath = resolve(directoryName)
    const isExist = await exist(directoryPath, 'directory')
    if(!isExist) throw new Error(errorMessage)

    const paths = []

    const items = await readdir(directoryPath, {recursive: true})
    for(const item of items) {
      const resolvedPath = resolve(directoryPath, item)
      const relativePath = relative(directoryPath, resolvedPath)
      const elem = await stat(resolvedPath)
      const ext = extname(resolvedPath).slice(1)
      if (elem.isFile() && ext === extension) {
        paths.push(relativePath)
      }
    }

    paths.sort((a,b) => a.localeCompare(b)).forEach(path => console.log(path))
  } catch {
    throw new Error(errorMessage)
  }
};

await findByExt();
