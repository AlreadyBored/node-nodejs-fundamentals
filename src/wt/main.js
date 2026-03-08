import os from 'node:os';
import fs from 'fs';
import path from 'path';
import { Worker } from 'worker_threads';

const splitArrayIntoChunks = (array, chunkCount = 1) => {
  const chunksArray = [];
  for (let i = 0; i < array.length; i += chunkCount) {
    const chunk = array.slice(i, i + chunkCount);
    chunksArray.push(chunk);
  }
  return chunksArray;
};

const runWorker = async (workerData) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.js', import.meta.url));
    worker.on('message', (result) => {
      worker.terminate();
      resolve(result);
    });

    worker.on('error', reject);

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });

    worker.postMessage(workerData);
  });
};

const mergeSortedArrays = (arrays) => {
  return arrays.flatMap((array) => array).sort((a, b) => a - b);
};

const main = async () => {
  // Write your code here
  // Read data.json containing array of numbers
  // Split into N chunks (N = CPU cores)
  // Create N workers, send one chunk to each
  // Collect sorted chunks
  // Merge using k-way merge algorithm
  // Log final sorted array

  const dataFilePath = path.join('data.json');
  const dataJson = await fs.promises.readFile(dataFilePath, 'utf-8');
  const dataArray = JSON.parse(dataJson);

  const cpuCount = os.cpus().length;

  const chunksArray = splitArrayIntoChunks(dataArray, cpuCount);

  const sortedChunks = [];

  for (const chunk of chunksArray) {
    const result = await runWorker(chunk);
    sortedChunks.push(result);
  }

  const sortedFinalArray = mergeSortedArrays(sortedChunks);
  console.log(sortedFinalArray);
};

await main();
