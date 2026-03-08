import { createReadStream, createWriteStream } from 'node:fs';
import fs, { constants } from 'node:fs/promises';
import path, { join } from 'node:path';
import { pipeline } from 'node:stream';
import { createBrotliDecompress } from 'node:zlib';
import { isFileOrDirectoryExist } from '../utils/util.js';

const decompressDir = async () => {
  const sourcePath = './workspace/compressed';
  const fromFile = join(sourcePath, 'archive.br');
  const toFolder = './workspace/decompressed';
  isFileOrDirectoryExist(sourcePath);
  isFileOrDirectoryExist(fromFile);

  try {
    await fs.access(toFolder, constants.F_OK);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(toFolder, { recursive: true });
    }
  }

  const readStream = createReadStream(fromFile);
  const transformStream = createBrotliDecompress();

  try {
    await pipeline(source, brotli, parseArchive);
  } catch (error) {
    console.error(Error(error));
  }
};

await decompressDir();
