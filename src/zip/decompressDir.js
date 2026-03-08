import { access, mkdir, writeFile } from 'fs/promises'
import { createReadStream } from 'fs'
import { createBrotliDecompress } from 'zlib'
import path from 'path'

const compressedDir = path.join(process.cwd(), 'workspace', 'compressed')
const archivePath = path.join(compressedDir, 'archive.br')
const decompressedDir = path.join(process.cwd(), 'workspace', 'decompressed')

const readBytes = (stream, n) => new Promise((resolve, reject) => {
  const tryRead = () => {
    const chunk = stream.read(n)
    if (chunk !== null) {
      resolve(chunk)
    } else {
      stream.once('readable', tryRead)
      stream.once('error', reject)
      stream.once('end', () => resolve(null))
    }
  }
  tryRead()
})

const decompressDir = async () => {
  try {
    await access(compressedDir)
    await access(archivePath)
  } catch {
    throw new Error('FS operation failed')
  }

  await mkdir(decompressedDir, { recursive: true })

  const brotli = createBrotliDecompress()
  createReadStream(archivePath).pipe(brotli)

  await new Promise((resolve) => brotli.once('readable', resolve))

  while (true) {
    const pathLenBuf = await readBytes(brotli, 4)
    if (pathLenBuf === null || pathLenBuf.length < 4) break

    const pathLen = pathLenBuf.readUInt32BE(0)

    const pathBuf = await readBytes(brotli, pathLen)
    if (pathBuf === null) break
    const relativePath = pathBuf.toString('utf8')

    const typeBuf = await readBytes(brotli, 1)
    if (typeBuf === null) break
    const isDir = typeBuf[0] === 1

    const sizeBuf = await readBytes(brotli, 8)
    if (sizeBuf === null) break
    const contentSize = Number(sizeBuf.readBigUInt64BE(0))

    const destPath = path.join(decompressedDir, relativePath)

    if (isDir) {
      await mkdir(destPath, { recursive: true })
    } else {
      await mkdir(path.dirname(destPath), { recursive: true })

      if (contentSize === 0) {
        await writeFile(destPath, Buffer.alloc(0))
      } else {
        let remaining = contentSize
        const chunks = []
        while (remaining > 0) {
          const toRead = Math.min(remaining, 65536)
          const chunk = await readBytes(brotli, toRead)
          if (chunk === null) break
          chunks.push(chunk)
          remaining -= chunk.length
        }
        await writeFile(destPath, Buffer.concat(chunks))
      }
    }
  }
}

await decompressDir()