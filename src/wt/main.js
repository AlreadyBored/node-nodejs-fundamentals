import { Worker } from 'worker_threads';
import { readFile } from 'fs/promises';
import { cpus } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const main = async () => {
  const data = JSON.parse(await readFile(path.join(__dirname, 'data.json'), 'utf-8'));
  const numCores = cpus().length;

  const chunkSize = Math.ceil(data.length / numCores);
  const chunks = [];
  for (let i = 0; i < numCores; i++) {
    chunks.push(data.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  const sortedChunks = await Promise.all(
    chunks.map((chunk, index) => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, 'worker.js'));
        worker.postMessage(chunk);
        worker.on('message', (sorted) => {
          resolve({ index, sorted });
        });
        worker.on('error', reject);
      });
    })
  );

  sortedChunks.sort((a, b) => a.index - b.index);
  const arrays = sortedChunks.map((c) => c.sorted);

  // k-way merge
  const pointers = new Array(arrays.length).fill(0);
  const result = [];
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);

  for (let i = 0; i < totalLength; i++) {
    let minVal = Infinity;
    let minIdx = -1;

    for (let j = 0; j < arrays.length; j++) {
      if (pointers[j] < arrays[j].length && arrays[j][pointers[j]] < minVal) {
        minVal = arrays[j][pointers[j]];
        minIdx = j;
      }
    }

    result.push(minVal);
    pointers[minIdx]++;
  }

  console.log(result);
};

await main();
