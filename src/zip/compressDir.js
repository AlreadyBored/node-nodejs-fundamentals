import { readdir, access, mkdir, stat } from 'fs/promises'
import { createReadStream, createWriteStream } from 'fs'
import { createBrotliCompress } from 'zlib'
import path from 'path'

const rootDir = path.join(process.cwd(), 'workspace', 'toCompress')
const compressedDir = path.join(process.cwd(), 'workspace', 'compressed')
const archivePath = path.join(compressedDir, 'archive.br')

// Binary framing format per entry:
//   [4 bytes: path length][path bytes][1 byte: type (0=file,1=dir)][8 bytes: content length][content bytes]
// For directories content length is 0.

const collectEntries = async (dir, base) => {
  const entries = []
  const items = await readdir(dir, { withFileTypes: true })
  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    const relativePath = path.relative(base, fullPath).split(path.sep).join('/')
    if (item.isDirectory()) {
      entries.push({ type: 'dir', relativePath })
      const nested = await collectEntries(fullPath, base)
      entries.push(...nested)
    } else if (item.isFile()) {
      const fileStats = await stat(fullPath)
      entries.push({ type: 'file', relativePath, fullPath, size: fileStats.size })
    }
  }
  return entries
}

const writeUInt32BE = (n) => {
  const buf = Buffer.allocUnsafe(4)
  buf.writeUInt32BE(n, 0)
  return buf
}

const writeBigUInt64BE = (n) => {
  const buf = Buffer.allocUnsafe(8)
  buf.writeBigUInt64BE(BigInt(n), 0)
  return buf
}

const compressDir = async () => {
  try {
    await access(rootDir)
  } catch {
    throw new Error('FS operation failed')
  }

  await mkdir(compressedDir, { recursive: true })

  const entries = await collectEntries(rootDir, rootDir)

  await new Promise((resolve, reject) => {
    const writeStream = createWriteStream(archivePath)
    const brotli = createBrotliCompress()

    brotli.pipe(writeStream)
    writeStream.on('finish', resolve)
    writeStream.on('error', reject)
    brotli.on('error', reject)

    const processEntries = async () => {
      for (const entry of entries) {
        const pathBuf = Buffer.from(entry.relativePath, 'utf8')
        brotli.write(writeUInt32BE(pathBuf.length))
        brotli.write(pathBuf)

        if (entry.type === 'dir') {
          brotli.write(Buffer.from([1]))
          brotli.write(writeBigUInt64BE(0))
        } else {
          brotli.write(Buffer.from([0]))
          brotli.write(writeBigUInt64BE(entry.size))

          await new Promise((res, rej) => {
            const rs = createReadStream(entry.fullPath)
            rs.on('data', chunk => brotli.write(chunk))
            rs.on('end', res)
            rs.on('error', rej)
          })
        }
      }
      brotli.end()
    }

    processEntries().catch(reject)
  })
}

await compressDir()