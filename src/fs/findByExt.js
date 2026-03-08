import fs from 'fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { WORKSPACE_DIR } from '../constants.js';

const getFilesByExt = (nodes, ext = '.txt') => {
  if (!ext.startsWith('.')) {
    ext = `.${ext}`;
  }

  const files = nodes.filter(
    (node) =>
      node.isFile() &&
      path.extname(node.name).toLowerCase() === ext.toLowerCase(),
  );

  const sortedFiles = files.sort((a, b) =>
    a.parentPath.localeCompare(b.parentPath),
  );

  return sortedFiles.map((file) =>
    path.join(
      file.parentPath.slice(
        file.parentPath.indexOf(WORKSPACE_DIR) + WORKSPACE_DIR.length + 1,
      ),
      file.name,
    ),
  );
};

const findByExt = async () => {
  try {
    const rootPath = path.resolve(WORKSPACE_DIR);
    const nodes = await fs.readdir(rootPath, {
      recursive: true,
      withFileTypes: true,
    });

    const options = {
      ext: {
        type: 'string',
        short: 'e',
      },
    };

    const { values } = parseArgs({ options });

    const files = getFilesByExt(nodes, values.ext);

    if (!files.length) {
      console.log(`No ${values.ext} files found`);
      return;
    }
    files.forEach((file) => console.log(file));
  } catch (err) {
    throw new Error(`FS operation failed: ${err.message}`);
  }
};

await findByExt();
