import { stat } from 'node:fs/promises'

export const exist = async(path, type) => {
  try {
    const res = await stat(path)
    return type === 'directory'? res.isDirectory() : res.isFile()
  } catch (error) {
    return false
  }
}