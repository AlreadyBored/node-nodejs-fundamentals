import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const decompressDir = async () => {
    let p1 = fileURLToPath(import.meta.url);
    let p2 = path.dirname(p1);
    let inDir = path.join(p2, 'workspace', 'compressed');
    let inFile = path.join(inDir, 'archive.br');
    let outDir = path.join(p2, 'workspace', 'decompressed');

    if (!fs.existsSync(inDir) || !fs.existsSync(inFile)) {
        let err = new Error('FS operation failed');
        throw err;
    }

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    let readStream = fs.createReadStream(inFile);
    let unbrotli = zlib.createBrotliDecompress();

    let jsonString = '';

    unbrotli.on('data', (chunk) => {
        jsonString = jsonString + chunk.toString();
    });

    unbrotli.on('end', () => {
        let allFiles = JSON.parse(jsonString);

        for (let i = 0; i < allFiles.length; i++) {
            let file = allFiles[i];
            let outPath = path.join(outDir, file.path);
            let dir = path.dirname(outPath);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            let buffer = Buffer.from(file.content, 'base64');
            fs.writeFileSync(outPath, buffer);
        }
    });

    readStream.pipe(unbrotli);
};

await decompressDir();