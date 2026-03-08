import { Worker } from 'worker_threads';
import { readFile } from 'fs/promises';
import { cpus } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

function kwayMerge(arrays) {
  const result = [];
  const indices = arrays.map(() => 0);

  while (true) {
    let minVal = Infinity;
    let minIdx = -1;

    for (let i = 0; i < arrays.length; i++) {
      if (indices[i] < arrays[i].length && arrays[i][indices[i]] < minVal) {
        minVal = arrays[i][indices[i]];
        minIdx = i;
      }
    }

    if (minIdx === -1) break;

    result.push(minVal);
    indices[minIdx]++;
  }

  return result;
}

const main = async () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const dataPath = join(process.cwd(), 'data.json');
  const workerPath = join(__dirname, 'worker.js');

  const data = JSON.parse(await readFile(dataPath, 'utf-8'));
  const numWorkers = Math.max(1, Math.min(cpus().length, data.length));
  const chunkSize = Math.ceil(data.length / numWorkers);
  const chunks = [];

  for (let i = 0; i < numWorkers; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, data.length);
    chunks.push(data.slice(start, end));
  }

  const sortedChunks = await Promise.all(
    chunks.map(
      (chunk) =>
        new Promise((resolve, reject) => {
          const worker = new Worker(workerPath, { workerData: null, eval: false });
          worker.postMessage(chunk);
          worker.on('message', (sorted) => {
            resolve(sorted);
            worker.terminate();
          });
          worker.on('error', reject);
        })
    )
  );

  const merged = kwayMerge(sortedChunks);
  console.log(merged);
};

await main();
