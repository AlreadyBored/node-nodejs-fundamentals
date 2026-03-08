import fs from 'node:fs/promises';
import path from 'node:path';

const merge = async () => {
    const workspacePath = path.resolve('workspace', 'parts');
    let filePaths;
    const filePathsToMerge = [];

    try {
        filePaths = await fs.readdir(workspacePath, {recursive: true});
    } catch {
        throw new Error('FS operation failed');
    }

    for (const file of filePaths) {
        const filePath = path.resolve(workspacePath, file);
        const stats = await fs.stat(filePath);

        if (stats.isDirectory() || path.extname(filePath) !== '.txt') {
            continue;
        }

        filePathsToMerge.push(filePath);
    }

    filePathsToMerge.sort();

    filePathsToMerge.forEach(async (filePath) => {
        const data = (await fs.readFile(filePath)).toString();
        const mergedPath = path.resolve('workspace', 'merged.txt');
        await fs.writeFile(mergedPath, '')
        await fs.appendFile(mergedPath, data);
    })
};

await merge();
