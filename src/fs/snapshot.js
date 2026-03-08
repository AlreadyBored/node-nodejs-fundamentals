import fs from 'node:fs/promises';
import path from 'node:path';

const snapshot = async () => {
    const workspacePath = path.resolve('workspace');
    const infoObject = {rootPath: workspacePath, entries: []};

    try {
        const files = await fs.readdir(workspacePath, {recursive: true});
        for (const file of files) {
            const filePath = path.resolve('workspace', file);
            const stats = await fs.stat(filePath);
        
            if (stats.isDirectory()) {
                infoObject.entries.push({path: file, type: 'directory'});
                continue;
            }

            const data = (await fs.readFile(filePath)).toString('base64');
            infoObject.entries.push({path: file, type: 'file', size: stats.size, content: data});
        } 
    } catch (e) {
        throw new Error('FS operation failed');
    }

    await fs.writeFile('snapshot.json', JSON.stringify(infoObject, null, '\t'));
};

await snapshot();
