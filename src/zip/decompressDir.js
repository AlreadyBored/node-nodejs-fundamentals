import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { pipeline } from 'stream/promises';
import tar from 'tar';

const decompressDir = async () => {
  const workspacePath = path.join(process.cwd(), 'workspace');
  const compressedPath = path.join(workspacePath, 'compressed');
  const archivePath = path.join(compressedPath, 'archive.br');
  const outputPath = path.join(workspacePath, 'decompressed');

  try {
    await fsp.access(compressedPath);
    await fsp.access(archivePath);

    await fsp.mkdir(outputPath, { recursive: true });

    await pipeline(
      fs.createReadStream(archivePath),
      zlib.createBrotliDecompress(),
      tar.x({ cwd: outputPath })
    );
  } catch {
    throw new Error('FS operation failed');
  }
};

await decompressDir();