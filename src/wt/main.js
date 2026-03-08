import { Worker } from 'node:worker_threads';
import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const main = async () => {
    let p1 = fileURLToPath(import.meta.url);
    let p2 = path.dirname(p1);
    let dataPath = path.join(p2, 'data.json');
    let workerPath = path.join(p2, 'worker.js');

    let fileData = await fs.readFile(dataPath, 'utf8');
    let numbers = JSON.parse(fileData);

    let n = os.cpus().length;
    let chunkSize = Math.ceil(numbers.length / n);
    let promises = [];

    for (let i = 0; i < n; i++) {
        let start = i * chunkSize;
        let end = start + chunkSize;
        let chunk = numbers.slice(start, end);

        let p = new Promise((resolve) => {
            let w = new Worker(workerPath);
            w.postMessage(chunk);
            w.on('message', (res) => {
                resolve(res);
                w.terminate();
            });
        });
        promises.push(p);
    }

    let chunks = await Promise.all(promises);
    
    let final = [];
    let pointers = [];
    for (let i = 0; i < chunks.length; i++) {
        pointers.push(0);
    }

    let totalLength = numbers.length;
    while (final.length < totalLength) {
        let minVal = null;
        let minIdx = -1;

        for (let i = 0; i < chunks.length; i++) {
            let p = pointers[i];
            if (p < chunks[i].length) {
                if (minVal === null || chunks[i][p] < minVal) {
                    minVal = chunks[i][p];
                    minIdx = i;
                }
            }
        }

        if (minIdx !== -1) {
            final.push(minVal);
            pointers[minIdx] = pointers[minIdx] + 1;
        }
    }

    console.log(final);
};

await main();