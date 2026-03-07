import { createReadStream, createWriteStream } from 'fs';
import { mkdir, stat } from 'fs/promises';
import { createBrotliDecompress } from 'zlib';
import path from 'path';

const decompressDir = async () => {
  const compressedDir = path.resolve('./workspace/compressed');
  const archivePath = path.join(compressedDir, 'archive.br');
  const destDir = path.resolve('./workspace/decompressed');

  try {
    const dirStat = await stat(compressedDir);
    if (!dirStat.isDirectory()) throw new Error();
    const fileStat = await stat(archivePath);
    if (!fileStat.isFile()) throw new Error();
    
    await mkdir(destDir, { recursive: true });

    const decompressor = createBrotliDecompress();
    createReadStream(archivePath).pipe(decompressor);

    let buffer = Buffer.alloc(0);
    const destPrefix = path.normalize(destDir + path.sep);
    const reader = decompressor[Symbol.asyncIterator]();

    const readFromStream = async (size) => {
      while (buffer.length < size) {
        const { value, done } = await reader.next();
        if (done) break;
        buffer = Buffer.concat([buffer, value]);
      }
      const data = buffer.slice(0, size);
      buffer = buffer.slice(size);
      return data;
    };

    while (true) {
      const head = await readFromStream(4);
      if (head.length === 0) break;
      if (head.length < 4) throw new Error();

      const pathLen = head.readUInt32BE(0);
      const pathBuf = await readFromStream(pathLen);
      if (pathBuf.length < pathLen) throw new Error();

      const relativePath = pathBuf.toString('utf8');
      if (!relativePath) throw new Error(); 

      const sizeBuf = await readFromStream(8);
      if (sizeBuf.length < 8) throw new Error();

      let remaining = Number(sizeBuf.readBigUInt64BE(0));
      const fullPath = path.resolve(destDir, ...relativePath.split('/'));
      
      if (!fullPath.startsWith(destPrefix)) throw new Error('Security risk');

      await mkdir(path.dirname(fullPath), { recursive: true });
      const writer = createWriteStream(fullPath);

      while (remaining > 0) {
        const chunkSize = Math.min(remaining, buffer.length || 65536);
        const chunk = await readFromStream(chunkSize);
        if (chunk.length === 0) throw new Error();
        
        if (!writer.write(chunk)) await new Promise(res => writer.once('drain', res));
        remaining -= chunk.length;
      }

      await new Promise((res, rej) => {
        writer.on('finish', res);
        writer.on('error', rej);
        writer.end();
      });
    }
  } catch {
    throw new Error('FS operation failed');
  }
};

await decompressDir();