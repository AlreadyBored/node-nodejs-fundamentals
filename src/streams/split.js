import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const split = async () => {
    let args = process.argv;
    let linesPerChunk = 10;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--lines') {
            linesPerChunk = Number(args[i + 1]);
        }
    }

    let currentPath = fileURLToPath(import.meta.url);
    let currentDir = path.dirname(currentPath);
    let sourcePath = path.join(currentDir, 'source.txt');

    let readStream = fs.createReadStream(sourcePath, { encoding: 'utf8' });
    
    let chunkNumber = 1;
    let currentLines = [];
    let leftover = '';

    readStream.on('data', (chunk) => {
        let text = leftover + chunk;
        let lines = text.split('\n');
        leftover = lines.pop();

        for (let i = 0; i < lines.length; i++) {
            currentLines.push(lines[i]);
            
            if (currentLines.length === linesPerChunk) {
                let outPath = path.join(currentDir, 'chunk_' + chunkNumber + '.txt');
                let content = currentLines.join('\n') + '\n';
                fs.writeFileSync(outPath, content);
                chunkNumber = chunkNumber + 1;
                currentLines = [];
            }
        }
    });

    readStream.on('end', () => {
        if (leftover !== '') {
            currentLines.push(leftover);
        }
        
        if (currentLines.length > 0) {
            let outPath = path.join(currentDir, 'chunk_' + chunkNumber + '.txt');
            let content = currentLines.join('\n') + '\n';
            fs.writeFileSync(outPath, content);
        }
    });
};

await split();