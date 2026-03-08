import fs from 'fs';
import path from 'path';
import { createBrotliDecompress } from 'zlib';
import { pipeline } from 'stream/promises';
import * as tar from 'tar';

const decompressDir = async () => {
  const archivePath = path.resolve('workspace/compressed/archive.br');
  const outputDir = path.resolve('workspace/decompressed');

  await fs.promises.mkdir(outputDir, { recursive: true });

  const readStream = fs.createReadStream(archivePath);
  const brotli = createBrotliDecompress();
  const extract = tar.x({ cwd: outputDir });

  await pipeline(readStream, brotli, extract);

  console.log('Archive decompressed into:', outputDir);
};

await decompressDir();
