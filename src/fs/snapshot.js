import fs from 'fs/promises';
import path from 'path';

const snapshot = async () => {
  const snapshot = {
    entries: [],
  };

  const workspacePath = path.join(process.cwd(), 'workspace');
  snapshot.rootPath = workspacePath;

  try {
    const fileDirents = await fs.readdir(workspacePath, { withFileTypes: true, recursive: true });

    const entries = await Promise.all(
      fileDirents.map(async (file) => {
        const fullPath = path.join(file.parentPath, file.name);
      
        const entry = {
          path: path.relative(workspacePath, fullPath),
          type: file.isFile() ? 'file' : 'directory',
        }

        if (file.isFile()) {
          const stat = await fs.stat(fullPath);
          entry.size = stat.size;

          const content = await fs.readFile(fullPath);
          entry.content = content.toString('base64');
        }

        return entry;
      })
    );
    
    snapshot.entries = entries;
    await fs.writeFile(path.join(process.cwd(), 'snapshot.json'), JSON.stringify(snapshot));
  } catch {
    throw new Error('FS operation failed')
  }
};

await snapshot();
