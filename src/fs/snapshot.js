import fs from 'fs/promises';
import path from 'node:path';
import { WORKSPACE_DIR, NODE_TYPES } from '../constants.js';

const entries = [];

const readAllDirectoryNodes = async (dir) => {
  try {
    const nodes = await fs.readdir(dir);

    for (const node of nodes) {
      const nodePath = path.join(dir, node);
      const relativeNodePath = nodePath.slice(
        nodePath.indexOf(WORKSPACE_DIR) + WORKSPACE_DIR.length + 1,
      );
      const stats = await fs.stat(nodePath);

      if (stats.isDirectory()) {
        entries.push({ path: relativeNodePath, type: NODE_TYPES.Directory });
        await readAllDirectoryNodes(nodePath);
      } else {
        const data = await fs.readFile(nodePath);

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
  } catch (err) {
    throw new Error(`FS operation failed: ${err.message}`);
  }
};

const snapshot = async () => {
  const rootPath = path.resolve(WORKSPACE_DIR);
  const directoryNodes = await readAllDirectoryNodes(WORKSPACE_DIR);

  const snapshotData = {
    rootPath,
    entries: directoryNodes,
  };

  await fs.writeFile(
    path.join(path.dirname(WORKSPACE_DIR), 'snapshot.json'),
    JSON.stringify(snapshotData, null, 2),
  );
};

await snapshot();
