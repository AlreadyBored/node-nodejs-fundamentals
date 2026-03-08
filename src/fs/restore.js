import fs from 'node:fs/promises';
import path from 'node:path';
import { Buffer } from 'node:buffer';

const restore = async () => {
    let snapshotData;
    const workspacePath = path.resolve('snapshot.json');

    try {
        await fs.mkdir(path.resolve('workspace_restored'));
        snapshotData = await fs.readFile(workspacePath, {encoding: 'utf8'})
    } catch (e) {
        throw new Error('FS operation failed');
    }

    const snapshotJson = JSON.parse(snapshotData);
    for (const entry of snapshotJson.entries) {
        if (entry.type == 'directory') {
            await fs.mkdir(path.resolve('workspace_restored', entry.path));
            continue;
        }

        const corePath = path.resolve('workspace_restored', entry.path);
        const buffer = Buffer.from(entry.content, 'base64');
        await fs.writeFile(corePath, buffer);
    }
};

await restore();
