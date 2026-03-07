import { join } from 'path'
import os from 'os'
import { readFile } from 'fs/promises';
import { Worker } from 'worker_threads';


function mergeArrays(chunks) {
  const res = [];
  const indices = chunks.map(() => 0);

  while (true) {
    let minVal = Infinity;
    let minChunkIndex = -1;

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const currentIndex = indices[chunkIndex];
      
      if (currentIndex < chunks[chunkIndex].length) {
        const val = chunks[chunkIndex][currentIndex];

        if (val < minVal) {
          minVal = val;
          minChunkIndex = chunkIndex;
        }
      }

    }

    if (minChunkIndex === -1) break;

    res.push(minVal);
    indices[minChunkIndex]++;
  }
  return res;
}

const main = async () => {
  const numCores = os.cpus().length;
  const workerPath = join(process.cwd(), 'src', 'wt', 'worker.js');

  const buf = await readFile(join(process.cwd(), 'data.json'));
  const arr = JSON.parse(buf.toString('utf-8'));
  const chunkSize = Math.ceil(arr.length / numCores);

  const chunks = Array.from({ length: numCores }, (_, index) =>
    arr.slice(index * chunkSize, index * chunkSize + chunkSize)
  ).filter((chunk) => chunk.length > 0);

  const sortedChunks = await Promise.all(
    chunks.map(
      (chunk) =>
        new Promise((resolve, reject) => {
          const worker = new Worker(workerPath);
          worker.postMessage(chunk);
          worker.on('message', (data) => resolve(data));
          worker.on('error', reject);
        })
    )
  );

  const merged = mergeArrays(sortedChunks);
  console.log(merged);
};

await main();
