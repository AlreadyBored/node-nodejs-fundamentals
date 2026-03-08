import fs from 'fs';
import zlib from 'zlib';
import path from 'node:path';
import {
  TO_COMPRESS_DIR,
  DECOMPRESSED_DIR,
  WORKSPACE_DIR,
  NODE_TYPES,
  COMPRESSED_DIR,
} from '../constants.js';

const restoreData = async (entries) => {
  const deCompressedDirPath = path.join(WORKSPACE_DIR, DECOMPRESSED_DIR);
  await fs.promises.rm(deCompressedDirPath, { recursive: true, force: true });
  await fs.promises.mkdir(deCompressedDirPath, { recursive: true });
  for (const entry of entries) {
    const entryPath = path.join(
      deCompressedDirPath,
      entry.path.split(TO_COMPRESS_DIR)[1],
    );
    if (entry.type === NODE_TYPES.Directory) {
      await fs.promises.mkdir(entryPath);
    }
    if (entry.type === NODE_TYPES.File) {
      await fs.promises.writeFile(
        entryPath,
        Buffer.from(entry.content, 'base64'),
      );
    }
  }
};

const getDecompressedData = async (file) => {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(file);
    const stream = readStream.pipe(zlib.createBrotliDecompress());

    readStream.on('error', (err) => {
      reject(err);
    });

    stream.on('error', (err) => {
      reject(err);
    });

    let data = '';

    stream.on('data', (chunk) => {
      data += chunk;
    });

    stream.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
  });
};

const decompressDir = async () => {
  // Write your code here
  // Read archive.br from workspace/compressed/
  // Decompress and extract to workspace/decompressed/
  // Use Streams API
  const compressedFilePath = path.join(
    WORKSPACE_DIR,
    COMPRESSED_DIR,
    'archive.br',
  );
  try {
    const decompressedData = await getDecompressedData(compressedFilePath);

    await restoreData(decompressedData);
  } catch (error) {
    throw new Error(`FS operation failed: ${error.message}`);
  }
};

await decompressDir();
