import fsPromises from 'node:fs/promises';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const verify = async () => {
    let currentPath = fileURLToPath(import.meta.url);
    let currentDir = path.dirname(currentPath);
    let jsonPath = path.join(currentDir, 'checksums.json');

    let jsonText = '';
    
    try {
        jsonText = await fsPromises.readFile(jsonPath, 'utf8');
    } catch (error) {
        throw new Error('FS operation failed');
    }

    let checksums = JSON.parse(jsonText);
    let fileNames = Object.keys(checksums);

    for (let i = 0; i < fileNames.length; i++) {
        let fileName = fileNames[i];
        let expectedHash = checksums[fileName];
        
        let filePath = path.join(currentDir, 'files', fileName);
        if (fs.existsSync(filePath) === false) {
            filePath = path.join(currentDir, fileName);
        }

        await new Promise((resolve) => {
            let stream = fs.createReadStream(filePath);
            let hash = crypto.createHash('sha256');

            stream.on('data', (chunk) => {
                hash.update(chunk);
            });

            stream.on('end', () => {
                let actualHash = hash.digest('hex');
                if (actualHash === expectedHash) {
                    console.log(fileName + ' - OK');
                } else {
                    console.log(fileName + ' - FAIL');
                }
                resolve();
            });

            stream.on('error', () => {
                console.log(fileName + ' - FAIL');
                resolve();
            });
        });
    }
};

await verify();
