import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const merge = async () => {
    let args = process.argv;
    let customFiles = null;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--files') {
            customFiles = args[i + 1].split(',');
        }
    }

    let p1 = fileURLToPath(import.meta.url);
    let p2 = path.dirname(p1);
    let partsPath = path.join(p2, 'workspace', 'parts');
    let mergedPath = path.join(p2, 'workspace', 'merged.txt');

    if (!fsSync.existsSync(partsPath)) {
        throw new Error('FS operation failed');
    }

    let filesToMerge = [];

    if (customFiles !== null) {
        for (let i = 0; i < customFiles.length; i++) {
            let fPath = path.join(partsPath, customFiles[i]);
            if (!fsSync.existsSync(fPath)) {
                throw new Error('FS operation failed');
            }
            filesToMerge.push(customFiles[i]);
        }
    } else {
        let items = await fs.readdir(partsPath, { withFileTypes: true });
        for (let i = 0; i < items.length; i++) {
            if (items[i].isFile() && items[i].name.endsWith('.txt')) {
                filesToMerge.push(items[i].name);
            }
        }
        if (filesToMerge.length === 0) {
            throw new Error('FS operation failed');
        }
        filesToMerge.sort();
    }

    let finalContent = '';

    for (let i = 0; i < filesToMerge.length; i++) {
        let fullPath = path.join(partsPath, filesToMerge[i]);
        let content = await fs.readFile(fullPath, 'utf8');
        finalContent = finalContent + content;
    }

    await fs.writeFile(mergedPath, finalContent);
};

await merge();