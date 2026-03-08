import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { cpus } from 'node:os';
import { readFile } from 'node:fs/promises';

const main = async () => {
  const currentFilePath = fileURLToPath(import.meta.url);
  const rootPath = join(currentFilePath, '..', '..', '..', 'data.json');
  const workerPath = join(currentFilePath, '..', 'worker.js');
  const data = JSON.parse(await readFile(rootPath, 'utf8'));

  if (!Array.isArray(data)) throw new Error('JSON must contain an array');

  const numCPUs = cpus().length;
  const chunkSize = Math.ceil(data.length / numCPUs);
  const chunks = [];

  for (let i = 0; i < numCPUs; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;

    chunks.push(data.slice(start, end));
  }

  const workers = chunks.map(() => new Worker(workerPath));
  const sortedChunks = await Promise.all(
    workers.map((worker, index) => {
      return new Promise((resolve, reject) => {
        worker.once('message', resolve);
        worker.once('error', reject);
        worker.postMessage(chunks[index]);
      });
    })
  );

  const finalSorted = mergeSortedChunks(sortedChunks);

  console.log('Final sorted array:', finalSorted);

  workers.forEach(w => w.terminate());
};

function mergeSortedChunks(arrays) {
  const result = [];
  const pointers = new Array(arrays.length).fill(0);

  while (true) {
    let minVal = Infinity;
    let minIdx = -1;

    for (let i = 0; i < arrays.length; i++) {
      const ptr = pointers[i];
      if (ptr < arrays[i].length && arrays[i][ptr] < minVal) {
        minVal = arrays[i][ptr];
        minIdx = i;
      }
    }

    if (minIdx === -1) break;

    result.push(minVal);
    pointers[minIdx]++;
  }

  return result;
}

await main();
