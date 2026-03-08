import { Worker } from 'worker_threads';
import os from 'os';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join} from 'path';
//import path from 'path';

const main = async () => {
  // Write your code here
  // Read data.json containing array of numbers
  // Split into N chunks (N = CPU cores)
  // Create N workers, send one chunk to each
  // Collect sorted chunks
  // Merge using k-way merge algorithm
  // Log final sorted array

  const raw = fs.readFileSync('data.json', 'utf-8');
  const numbers = JSON.parse(raw);

  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error('data.json must contain a non-empty array of numbers');
  }

  const cpuCount = os.cpus().length;

  const chunks = split(numbers, cpuCount);

  const sortedChunks = await Promise.all(
    chunks.map((chunk) => sortChunkInWorker(chunk))
  );

  // K-way merge
  console.log(kWayMerge(sortedChunks));
  // process.exit(0)
};

function split(array, n) {
  const chunks = []
  const size = Math.ceil(array.length / n)
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

function kWayMerge(sortedArrays) {
  const pointers = new Array(sortedArrays.length).fill(0);
  const totalLength = sortedArrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Array(totalLength);

  for (let i = 0; i < totalLength; i++) {
    let minVal = Infinity;
    let minIdx = -1;

    for (let k = 0; k < sortedArrays.length; k++) {
      if (
        pointers[k] < sortedArrays[k].length &&
        sortedArrays[k][pointers[k]] < minVal
      ) {
        minVal = sortedArrays[k][pointers[k]];
        minIdx = k;
      }
    }

    result[i] = minVal;
    pointers[minIdx]++;
  }

  return result;
}

function sortChunkInWorker(chunk) {
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = dirname(__filename);

  return new Promise((resolve, reject) => {
    const worker = new Worker(join(__dirname, 'worker.js'))

    worker.on('message', (sorted) => resolve(sorted))

    worker.on('error', (err) => reject(err))

    worker.on('exit', (code) => {
      if (code != 0) reject(new Error(`Worker exited with code ${code}`))
    })

    worker.postMessage(chunk)
  })
}



await main();
