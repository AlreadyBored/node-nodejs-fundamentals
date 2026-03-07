import { readFile} from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'path'
import { exist } from '../shared/utils/index.js'
import { fileURLToPath } from 'node:url'

const errorMessage = "FS operation failed"
const fileName = 'checksums.json'


const verify = async () => {
  const rootPath = dirname(fileURLToPath(import.meta.url))
  const pathToFile = resolve(fileName)

  try {
    const isExist = await exist(pathToFile, 'file')
    if(!isExist) throw new Error(errorMessage)

    const content = await readFile(pathToFile)
    const obj = JSON.parse(content)

    for(const [key, val] of Object.entries(obj)) {
      const filePath = resolve(rootPath, key)
      const stream = createReadStream(filePath)
      const hash = createHash('sha256')
      for await (const chunk of stream) {
        hash.update(chunk)
      }
      const result = val === hash.digest('hex') ? 'OK' : 'FAIL'
      console.log(`${key} - ${result}`)
    }
  } catch {
    throw new Error(errorMessage)
  }
};

await verify();
