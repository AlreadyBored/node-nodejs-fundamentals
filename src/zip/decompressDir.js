import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { createBrotliDecompress } from 'node:zlib';

const decompressDir = async () => {
  // Write your code here
  // Read archive.br from workspace/compressed/
  // Decompress and extract to workspace/decompressed/
  // Use Streams API
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);
  const archivePath = path.resolve(currentDir, '../../workspace/compressed/archive.br');
  const targetRoot = path.resolve(currentDir, '../../workspace/decompressed');

  let archivePayload = '';

  try {
    await pipeline(
      createReadStream(archivePath),
      createBrotliDecompress(),
      new Writable({
        write(chunk, encoding, callback) {
          archivePayload += chunk.toString('utf8');
          callback();
        },
      }),
    );

    const archive = JSON.parse(archivePayload);

    if (!archive || !Array.isArray(archive.entries)) {
      throw new Error('Invalid archive format');
    }

    await rm(targetRoot, { recursive: true, force: true });
    await mkdir(targetRoot, { recursive: true });

    for (const entry of archive.entries) {
      if (!entry || typeof entry.path !== 'string' || typeof entry.type !== 'string') {
        throw new Error('Invalid archive entry');
      }

      const targetPath = path.resolve(targetRoot, path.normalize(entry.path));
      if (targetPath !== targetRoot && !targetPath.startsWith(`${targetRoot}${path.sep}`)) {
        throw new Error('Invalid archive entry path');
      }

      if (entry.type === 'directory') {
        await mkdir(targetPath, { recursive: true });
      } else if (entry.type === 'file') {
        await mkdir(path.dirname(targetPath), { recursive: true });

        const fileContent = typeof entry.content === 'string'
          ? Buffer.from(entry.content, 'base64')
          : Buffer.alloc(0);

        await pipeline(Readable.from([fileContent]), createWriteStream(targetPath));
      } else {
        throw new Error('Invalid archive entry type');
      }
    }
  } catch {
    throw new Error('ZLIB operation failed');
  }
};

await decompressDir();
