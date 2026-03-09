import { createWriteStream } from 'node:fs';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { createBrotliCompress } from 'node:zlib';

const compressDir = async () => {
  // Write your code here
  // Read all files from workspace/toCompress/
  // Compress entire directory structure into archive.br
  // Save to workspace/compressed/
  // Use Streams API
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);
  const sourceRoot = path.resolve(currentDir, '../../workspace/toCompress');
  const targetDir = path.resolve(currentDir, '../../workspace/compressed');
  const archivePath = path.resolve(targetDir, 'archive.br');

  const entries = [];

  const toArchivePath = (absolutePath) => path.relative(sourceRoot, absolutePath).split(path.sep).join('/');

  const scanDirectory = async (directoryPath) => {
    const items = await readdir(directoryPath, { withFileTypes: true });
    items.sort((left, right) => left.name.localeCompare(right.name));

    for (const item of items) {
      const itemPath = path.join(directoryPath, item.name);
      const relativePath = toArchivePath(itemPath);

      if (item.isDirectory()) {
        entries.push({
          path: relativePath,
          type: 'directory',
        });

        await scanDirectory(itemPath);
      } else if (item.isFile()) {
        const content = await readFile(itemPath);
        entries.push({
          path: relativePath,
          type: 'file',
          content: content.toString('base64'),
        });
      }
    }
  };

  try {
    await scanDirectory(sourceRoot);
    await mkdir(targetDir, { recursive: true });

    const archivePayload = JSON.stringify({
      root: 'toCompress',
      entries,
    });

    await pipeline(
      Readable.from([archivePayload]),
      createBrotliCompress(),
      createWriteStream(archivePath),
    );
  } catch {
    throw new Error('ZLIB operation failed');
  }
};

await compressDir();
