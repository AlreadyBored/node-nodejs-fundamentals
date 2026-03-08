import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const snapshot = async () => {
    let p1 = fileURLToPath(import.meta.url);
    let p2 = path.dirname(p1);
    let workspacePath = path.join(p2, 'workspace');
    let snapshotPath = path.join(p2, 'snapshot.json');

    if (!fsSync.existsSync(workspacePath)) {
        throw new Error('FS operation failed');
    }

    let entries = [];

    const scan = async (currentDir, relativeDir) => {
        let items = await fs.readdir(currentDir, { withFileTypes: true });
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let fullPath = path.join(currentDir, item.name);
            
            let relPath = item.name;
            if (relativeDir !== '') {
                relPath = path.join(relativeDir, item.name);
            }
            relPath = relPath.split('\\').join('/');

            if (item.isDirectory()) {
                entries.push({
                    path: relPath,
                    type: 'directory'
                });
                await scan(fullPath, relPath);
            } else {
                let stat = await fs.stat(fullPath);
                let buffer = await fs.readFile(fullPath);
                let content = buffer.toString('base64');
                entries.push({
                    path: relPath,
                    type: 'file',
                    size: stat.size,
                    content: content
                });
            }
        }
    };

    await scan(workspacePath, '');

    let result = {
        rootPath: workspacePath,
        entries: entries
    };

    await fs.writeFile(snapshotPath, JSON.stringify(result, null, 2));
};

await snapshot();