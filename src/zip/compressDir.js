import { createReadStream, createWriteStream } from 'fs';
import { readdir, stat, mkdir } from 'fs/promises';
import { createBrotliCompress } from 'zlib';
import path from 'path';

async function* getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) yield* getFiles(res);
    else if (entry.isFile()) yield res;
  }
}

const compressDir = async () => {
  const srcDir = path.resolve('./workspace/toCompress');
  const destDir = path.resolve('./workspace/compressed');
  const archivePath = path.join(destDir, 'archive.br');

  try {
    const srcStat = await stat(srcDir);
    if (!srcStat.isDirectory()) throw new Error();
    await mkdir(destDir, { recursive: true });

    const compressor = createBrotliCompress();
    const output = createWriteStream(archivePath);
    compressor.pipe(output);

    for await (const filePath of getFiles(srcDir)) {
      const relativePath = path.relative(srcDir, filePath).split(path.sep).join('/');
      if (!relativePath) continue; 

      const pathBuf = Buffer.from(relativePath, 'utf8');
      const fileStat = await stat(filePath);

      const header = Buffer.alloc(4 + pathBuf.length + 8);
      header.writeUInt32BE(pathBuf.length, 0);
      pathBuf.copy(header, 4);
      header.writeBigUInt64BE(BigInt(fileStat.size), 4 + pathBuf.length);
      
      if (!compressor.write(header)) await new Promise(res => compressor.once('drain', res));

      const fileStream = createReadStream(filePath);
      for await (const chunk of fileStream) {
        if (!compressor.write(chunk)) await new Promise(res => compressor.once('drain', res));
      }
    }

    const finalization = new Promise((res, rej) => {
      output.on('finish', res);
      compressor.on('error', rej);
      output.on('error', rej);
    });

    compressor.end();
    await finalization;
  } catch {
    throw new Error('FS operation failed');
  }
};

await compressDir();