import { readFile } from 'node:fs/promises';
import { cpus } from 'node:os';
import { Worker } from 'node:worker_threads';
import { resolve } from 'node:path';

const kWayMerge = (arrays) => {
  const idx = new Array(arrays.length).fill(0);
  const result = [];

  while (true) {
    let minVal = Infinity;
    let minArr = -1;

    for (let i = 0; i < arrays.length; i++) {
      const j = idx[i];
      if (j < arrays[i].length && arrays[i][j] < minVal) {
        minVal = arrays[i][j];
        minArr = i;
      }
    }

    if (minArr === -1) break;
    result.push(minVal);
    idx[minArr]++;
  }

  return result;
};

const runWorker = (chunk) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.js', import.meta.url), {
      workerData: { chunk }
    });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with ${code}`));
    });
  });
};

const main = async () => {
  const raw = await readFile('data.json', 'utf8');
  const data = JSON.parse(raw);
  
  const coreCount = cpus().length || 1;
  const chunkSize = Math.ceil(data.length / coreCount);
  const chunks = [];

  for (let i = 0; i < coreCount; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, data.length);
    if (start < end) chunks.push(data.slice(start, end));
  }

  console.log(`Cores: ${coreCount}, Chunks: ${chunks.length}`);
  
  const sortedChunks = await Promise.all(chunks.map(runWorker));
  const merged = kWayMerge(sortedChunks);
  
  console.log(JSON.stringify(merged));
};

await main();
