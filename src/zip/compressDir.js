import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const compressDir = async () => {
    let p1 = fileURLToPath(import.meta.url);
    let p2 = path.dirname(p1);
    let inDir = path.join(p2, 'workspace', 'toCompress');
    let outDir = path.join(p2, 'workspace', 'compressed');

    if (!fs.existsSync(inDir)) {
        let err = new Error('FS operation failed');
        throw err;
    }

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    let allFiles = [];

    const readFolder = (folderPath, relativePath) => {
        let items = fs.readdirSync(folderPath, { withFileTypes: true });
        
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let fullPath = path.join(folderPath, item.name);
            let relPath = path.join(relativePath, item.name);

            if (item.isDirectory()) {
                readFolder(fullPath, relPath);
            } else {
                let content = fs.readFileSync(fullPath, 'base64');
                allFiles.push({
                    path: relPath,
                    content: content
                });
            }
        }
    };

    readFolder(inDir, '');

    let jsonString = JSON.stringify(allFiles);

    let outFile = path.join(outDir, 'archive.br');
    let writeStream = fs.createWriteStream(outFile);
    let brotli = zlib.createBrotliCompress();

    brotli.pipe(writeStream);
    brotli.write(jsonString);
    brotli.end();
};

await compressDir();