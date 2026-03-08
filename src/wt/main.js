import fs from 'node:fs/promises';
import { Worker } from 'worker_threads';
import os from 'os';
import path from 'path';

const main = async () => {
  const dataPath = path.join(import.meta.dirname, 'data.json');
  let rawData;
  try {
    rawData = await fs.readFile(dataPath, 'utf8');
  } catch {
    console.error('Failed to read data.json');
    return;
  }

  const data = JSON.parse(rawData);
  const n = os.cpus().length || 1;
  const workersCount = n;

  const chunks = [];
  const chunkSize = Math.ceil(data.length / workersCount);

  for (let i = 0; i < workersCount; i++) {
    chunks.push(data.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  const workerPromises = chunks.map((chunk, index) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(import.meta.dirname, 'worker.js'));
      worker.postMessage(chunk);

      worker.on('message', (sortedChunk) => {
        resolve({ index, sortedChunk });
      });

      worker.on('error', reject);
    });
  });

  const results = await Promise.all(workerPromises);

  results.sort((a, b) => a.index - b.index);
  const sortedChunks = results.map((r) => r.sortedChunk);

  const merge = (arrays) => {
    const minHeap = [];
    const merged = [];

    for (let i = 0; i < arrays.length; i++) {
      if (arrays[i].length > 0) {
        minHeap.push({ val: arrays[i][0], arrIdx: i, elIdx: 0 });
      }
    }

    minHeap.sort((a, b) => a.val - b.val);

    while (minHeap.length > 0) {
      const minInfo = minHeap.shift();
      merged.push(minInfo.val);

      if (minInfo.elIdx + 1 < arrays[minInfo.arrIdx].length) {
        minHeap.push({
          val: arrays[minInfo.arrIdx][minInfo.elIdx + 1],
          arrIdx: minInfo.arrIdx,
          elIdx: minInfo.elIdx + 1,
        });
        minHeap.sort((a, b) => a.val - b.val);
      }
    }

    return merged;
  };

  const finalSorted = merge(sortedChunks);
  console.log(finalSorted);
};

await main();
