import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const restore = async () => {
    let p1 = fileURLToPath(import.meta.url);
    let p2 = path.dirname(p1);
    let snapshotPath = path.join(p2, 'snapshot.json');
    let restoredPath = path.join(p2, 'workspace_restored');

    if (!fsSync.existsSync(snapshotPath)) {
        throw new Error('FS operation failed');
    }

    if (fsSync.existsSync(restoredPath)) {
        throw new Error('FS operation failed');
    }

    let fileData = await fs.readFile(snapshotPath, 'utf8');
    let data = JSON.parse(fileData);

    await fs.mkdir(restoredPath, { recursive: true });

    let entries = data.entries;
    for (let i = 0; i < entries.length; i++) {
        let entry = entries[i];
        let fullPath = path.join(restoredPath, entry.path);

        if (entry.type === 'directory') {
            await fs.mkdir(fullPath, { recursive: true });
        } else {
            let dir = path.dirname(fullPath);
            if (!fsSync.existsSync(dir)) {
                await fs.mkdir(dir, { recursive: true });
            }
            let buffer = Buffer.from(entry.content, 'base64');
            await fs.writeFile(fullPath, buffer);
        }
    }
};

await restore();