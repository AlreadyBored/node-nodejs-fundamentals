import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const findByExt = async () => {
    let args = process.argv;
    let ext = '.txt';

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--ext') {
            ext = args[i + 1];
        }
    }

    if (!ext.startsWith('.')) {
        ext = '.' + ext;
    }

    let p1 = fileURLToPath(import.meta.url);
    let p2 = path.dirname(p1);
    let workspacePath = path.join(p2, 'workspace');

    if (!fsSync.existsSync(workspacePath)) {
        throw new Error('FS operation failed');
    }

    let result = [];

    const scan = async (currentDir, relativeDir) => {
        let items = await fs.readdir(currentDir, { withFileTypes: true });
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let fullPath = path.join(currentDir, item.name);
            
            let relPath = item.name;
            if (relativeDir !== '') {
                relPath = path.join(relativeDir, item.name);
            }

            if (item.isDirectory()) {
                await scan(fullPath, relPath);
            } else {
                if (item.name.endsWith(ext)) {
                    result.push(relPath.split('\\').join('/'));
                }
            }
        }
    };

    await scan(workspacePath, '');

    result.sort();

    for (let i = 0; i < result.length; i++) {
        console.log(result[i]);
    }
};

await findByExt();