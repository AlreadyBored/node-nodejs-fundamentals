import { createReadStream, createWriteStream } from 'fs';
import { join, relative } from 'path';
import fs, { constants } from 'node:fs/promises';
import { pipeline } from 'stream/promises';
import { createBrotliCompress } from 'node:zlib';
import { isFileOrDirectoryExist, getFilesRecursively } from '../utils/util.js';
import { Readable } from 'node:stream';

const compress = async () => {
  const sourcePath = './workspace/toCompress';
  const finalToPath = './workspace/compressed';
  const toFile = join(finalToPath, 'archive.br');
  isFileOrDirectoryExist(sourcePath);

  try {
    await fs.access(finalToPath, constants.F_OK);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(finalToPath, { recursive: true });
    }
  }
  

  try {
    const files = await getFilesRecursively(sourcePath);

    async function* iterativeWriteinArchive() {
      for await (const file of files) {
        const relativePath = relative(sourcePath, file);
        const fileStat = await fs.stat(file);

        const header = Buffer.from(`${relativePath.length}:${relativePath}:${fileStat.size}:`);
        yield header;

        const readStream = createReadStream(file);
        for await (const chunk of readStream) {
          yield chunk;
        }
      }
    }

    await pipeline(
      Readable.from(iterativeWriteinArchive()),
      createBrotliCompress(),
      createWriteStream(toFile)
    )
  } catch (error) {
    console.error(Error(error));
  }
}

await compress();
