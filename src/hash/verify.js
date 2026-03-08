import crypto from 'node:crypto';
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const verify = async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const file = path.join(__dirname, 'checksums.json');
    if (!fs.existsSync(file)) {
        throw new Error('FS operation failed');
    }

    const checksums = JSON.parse(fs.readFileSync(file, 'utf8'));

    for (const [filename, storedHash] of Object.entries(checksums)) {
        const relativePath = path.join(__dirname, filename);
        if (!fs.existsSync(relativePath)) {
            throw new Error('FS operation failed');
        }

        const stream = fs.createReadStream(relativePath);
        const hash = crypto.createHash('sha256');

        await pipeline(stream, hash);

        const result = hash.digest('hex');
        const status = result === storedHash ? 'OK' : 'FAIL';
        console.log(`${filename} — ${status}`);
    }
};

await verify();
