import { Worker } from 'worker_threads';
import os from 'os';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const main = async () => {
  const data = JSON.parse(await readFile('data.json', 'utf8'));
  const cpuCount = os.cpus().length;
  const chunkSize = Math.ceil(data.length / cpuCount);

  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const workerPath = path.join(__dirname, 'worker.js');

  const sortedChunks = await Promise.all(
    chunks.map(
      (chunk) =>
        new Promise((resolve, reject) => {
          const worker = new Worker(workerPath);
          worker.on('message', (sorted) => {
            resolve(sorted);
            worker.terminate();
          });
          worker.on('error', reject);
          worker.postMessage(chunk);
        }),
    ),
  );

  const sorted = sortedChunks.flat().sort((a, b) => a - b);
  console.log(sorted);
};

await main();
