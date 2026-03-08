import fs from 'fs';
import zlib from 'zlib';
import path from 'node:path';
import {
  TO_COMPRESS_DIR,
  WORKSPACE_DIR,
  NODE_TYPES,
  COMPRESSED_DIR,
} from '../constants.js';

const entries = [];
const readAllDirectoryNodes = async (dir) => {
  const nodes = await fs.promises.readdir(dir);

  for (const node of nodes) {
    const nodePath = path.join(dir, node);
    const relativeNodePath = nodePath.slice(
      nodePath.indexOf(WORKSPACE_DIR) + WORKSPACE_DIR.length + 1,
    );
    const stats = await fs.promises.stat(nodePath);

    if (stats.isDirectory()) {
      entries.push({ path: relativeNodePath, type: NODE_TYPES.Directory });
      await readAllDirectoryNodes(nodePath);
    } else {
      const data = await fs.promises.readFile(nodePath);

      const base64Content = data.toString('base64');

      entries.push({
        path: relativeNodePath,
        type: NODE_TYPES.File,
        size: stats.size,
        content: base64Content,
      });
    }
  }

  return entries;
};

const compress = async (jsonData) => {
  const compressedDirPath = path.join(WORKSPACE_DIR, COMPRESSED_DIR);

  await fs.promises.mkdir(compressedDirPath, { recursive: true });

  const output = fs.createWriteStream(
    path.join(compressedDirPath, 'archive.br'),
  );
  const brotli = zlib.createBrotliCompress();

  brotli.pipe(output);
  brotli.write(jsonData);
  brotli.end();
};

const compressDir = async () => {
  // Write your code here
  // Read all files from workspace/toCompress/
  // Compress entire directory structure into archive.br
  // Save to workspace/compressed/
  // Use Streams API

  const toCompressDir = path.join(WORKSPACE_DIR, TO_COMPRESS_DIR);
  try {
    const directoryNodes = await readAllDirectoryNodes(toCompressDir);

    await compress(JSON.stringify(directoryNodes, null, 2));
  } catch (error) {
    throw new Error(`FS operation failed: ${error.message}`);
  }
};

await compressDir();
