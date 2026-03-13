import { cpus } from 'os';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Worker } from 'worker_threads';

const __dirname = dirname(fileURLToPath(import.meta.url));

const parseData = async () => {
  try {
    const raw = await readFile(join(__dirname, 'data.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    throw new Error('FS operation failed');
  }
};

function chunkArray(array, count) {
  // Corner case: fewer elements than threads — one chunk per element
  const chunkCount = Math.min(count, array.length);
  const result = [];
  const baseSize = Math.floor(array.length / chunkCount);
  const remainder = array.length % chunkCount;
  let offset = 0;

  for (let i = 0; i < chunkCount; i++) {
    const size = baseSize + (i < remainder ? 1 : 0);
    result.push(array.slice(offset, offset + size));
    offset += size;
  }

  return result;
}


function mergeChunks(sortedChunks) {
  const result = [];
  // Track current index for each chunk
  const indices = new Array(sortedChunks.length).fill(0);

  while (true) {
    let minValue = Infinity;
    let minChunk = -1;

    // Find the minimum element across all chunk heads
    for (let i = 0; i < sortedChunks.length; i++) {
      if (indices[i] < sortedChunks[i].length && sortedChunks[i][indices[i]] < minValue) {
        minValue = sortedChunks[i][indices[i]];
        minChunk = i;
      }
    }

    // All chunks exhausted
    if (minChunk === -1) break;

    result.push(minValue);
    indices[minChunk]++;
  }

  return result;
}


function createWorker(chunk) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(join(__dirname, './worker.js'));

    worker.on('message', resolve);
    worker.on('error', reject);

    worker.postMessage(chunk);
  });
}



const main = async () => {

  const threads = cpus().length;
  const data = await parseData();
  const chunks = chunkArray(data, threads);

  const results = await Promise.all(chunks.map(createWorker));

  const sorted = mergeChunks(results);
  console.log(sorted);


};

await main();
