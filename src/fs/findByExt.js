import fs from 'node:fs/promises';
import path from 'node:path';

const findByExt = async () => {
    const args = process.argv.slice(2);
    let extension;
    const flagIndex = args.indexOf('--ext');

    if (flagIndex !== '-1' && args.length > flagIndex + 1) {
        extension = '.' + args[flagIndex + 1];
    } else {
        extension = '.txt';
    }

    const workspacePath = path.resolve('workspace');
    const filesWithExtension = [];
    let files;

    try {
        files = await fs.readdir(workspacePath, {recursive: true});
    } catch {
        throw new Error('FS operation failed');
    }
    
    for (const file of files) {
        const filePath = path.resolve('workspace', file);
        const stats = await fs.stat(filePath);

        if (stats.isDirectory()) {
            continue;
        }

        if (path.extname(filePath) === extension) {
            filesWithExtension.push(path.relative(workspacePath, filePath));
        }
    }

    filesWithExtension.sort();
    filesWithExtension.forEach(file => {
        console.log(file);
    })
};

await findByExt();
