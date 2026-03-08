import fs from 'fs/promises';
import path from 'node:path';

import { NODE_TYPES, WORKSPACE_DIR } from '../constants.js';

const WORKSPACE_RESTORE_DIR = 'workspace_restored';

const restoreData = async (data) => {
  const { entries } = data;

  for (const entry of entries) {
    const entryPath = path.join(WORKSPACE_RESTORE_DIR, entry.path);
    if (entry.type === NODE_TYPES.Directory) {
      await fs.mkdir(entryPath);
    }
    if (entry.type === NODE_TYPES.File) {
      await fs.writeFile(entryPath, Buffer.from(entry.content, 'base64'));
    }
  }
};

const restore = async () => {
  try {
    await fs.mkdir(WORKSPACE_RESTORE_DIR);

    const snapshotDataJson = await fs.readFile(
      path.join(path.dirname(WORKSPACE_DIR), 'snapshot.json'),
    );

    const snapshotData = JSON.parse(snapshotDataJson);

    await restoreData(snapshotData);
  } catch (error) {
    throw new Error(`FS operation failed: ${error.message}`);
  }
};

await restore();
