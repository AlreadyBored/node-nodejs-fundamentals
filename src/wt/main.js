import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { Worker } from 'worker_threads';

const main = async () => {
  const filePath = path.resolve('data.json');

  const raw = await fs.readFile(filePath, 'utf8');
  const numbers = JSON.parse(raw);

  const cores = os.cpus().length;
  const chunkSize = Math.ceil(numbers.length / cores);

  const chunks = [];
  for (let i = 0; i < cores; i++) {
    chunks.push(numbers.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  const results = new Array(chunks.length);

  await Promise.all(
    chunks.map((chunk, index) => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(new URL('./worker.js', import.meta.url));

        worker.postMessage(chunk);

        worker.on('message', (sortedChunk) => {
          results[index] = sortedChunk;
          resolve();
        });

        worker.on('error', reject);
      });
    })
  );

  const merged = kWayMerge(results);

  console.log(merged);
};

function kWayMerge(arrays) {
  const pointers = new Array(arrays.length).fill(0);
  const result = [];

  while (true) {
    let min = Infinity;
    let minIndex = -1;

    for (let i = 0; i < arrays.length; i++) {
      if (pointers[i] < arrays[i].length) {
        const value = arrays[i][pointers[i]];
        if (value < min) {
          min = value;
          minIndex = i;
        }
      }
    }

    if (minIndex === -1) break;

    result.push(min);
    pointers[minIndex]++;
  }

  return result;
}

await main();
