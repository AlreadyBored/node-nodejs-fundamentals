import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { Worker } from 'worker_threads';

const main = async () => {
  const dataPath = path.join(process.cwd(), 'data.json');
  let numbers;
  try {
    numbers = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
  } catch {
    throw new Error('FS operation failed');
  }

  const numCores = os.cpus().length;
  const chunkSize = Math.ceil(numbers.length / numCores);
  const chunks = [];
  for (let i = 0; i < numCores; i++) {
    chunks.push(numbers.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  const results = new Array(numCores);

  await Promise.all(
    chunks.map((chunk, idx) =>
      new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, 'worker.js'));
        worker.postMessage(chunk);
        worker.on('message', (sortedChunk) => {
          results[idx] = sortedChunk;
          resolve();
        });
        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
      })
    )
  );

  const pointers = Array(numCores).fill(0);
  const merged = [];
  while (true) {
    let min = Infinity;
    let minIdx = -1;
    for (let i = 0; i < numCores; i++) {
      if (pointers[i] < results[i].length) {
        if (results[i][pointers[i]] < min) {
          min = results[i][pointers[i]];
          minIdx = i;
        }
      }
    }
    if (minIdx === -1) break;
    merged.push(min);
    pointers[minIdx]++;
  }

  console.log(merged);
};

await main();