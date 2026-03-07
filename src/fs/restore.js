import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { exist } from '../shared/utils/index.js'

const directoryName = "workspace_restored"
const snapshotFile = "snapshot.json"
const errorMessage = "FS operation failed"

const restore = async () => {
  try {
    const pathToDirectory = resolve(directoryName)
    const pathToSnapshot = resolve(snapshotFile)

    const isExist = await exist(pathToDirectory, 'directory')
    if (isExist) throw new Error(errorMessage)

    const isExistSnapshot = await exist(pathToSnapshot, 'file')
    if (!isExistSnapshot) throw new Error(errorMessage)

    const buffer = await readFile(pathToSnapshot)
    const obj = JSON.parse(buffer.toString())

    const entries = obj.entries

    await mkdir(pathToDirectory)

    for (const entry of entries) {
      const targetPath = resolve(pathToDirectory, entry.path)

      if (entry.type === 'file') {
        await mkdir(dirname(targetPath), {recursive: true})
        const content = Buffer.from(entry.content, 'base64')
        await writeFile(targetPath, content)
      }

      if (entry.type === 'directory') {
        await mkdir(targetPath, {recursive: true})
      }
    }

    console.log(directoryName + ' has been successful created')
  } catch {
    throw new Error(errorMessage)
  }
};

await restore();
