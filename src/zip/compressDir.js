import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const compressDir = async () => {
  const workspacePath = path.join(process.cwd(), 'workspace');
  const sourcePath = path.join(workspacePath, 'toCompress');
  const compressedPath = path.join(workspacePath, 'compressed');
  const archivePath = path.join(compressedPath, 'archive.br');

  const entries = [];

  const streamToBuffer = async (filePath) => {
    const chunks = [];
    const stream = fs.createReadStream(filePath);

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  };

  const scan = async (currentPath) => {
    const items = await fsp.readdir(currentPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);
      const relativePath = path.relative(sourcePath, fullPath);

      if (item.isDirectory()) {
        entries.push({
          path: relativePath,
          type: 'directory',
        });

        await scan(fullPath);
      } else if (item.isFile()) {
        const content = await streamToBuffer(fullPath);

        entries.push({
          path: relativePath,
          type: 'file',
          content: content.toString('base64'),
        });
      }
    }
  };

  try {
    await fsp.access(sourcePath);
    await fsp.mkdir(compressedPath, { recursive: true });

    await scan(sourcePath);

    const archiveData = JSON.stringify({ entries });

    await pipeline(
      Readable.from([archiveData]),
      zlib.createBrotliCompress(),
      fs.createWriteStream(archivePath)
    );
  } catch {
    throw new Error('FS operation failed');
  }
};

await compressDir();