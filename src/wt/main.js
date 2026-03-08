import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { Worker } from 'worker_threads';
import fsp from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 

const main = async () => {
  const baseDir = path.join(__dirname, '../../');
  const dataPath = path.join(baseDir, 'data.json');

  let numbers;
  try {
    const data = await fsp.readFile(dataPath, 'utf8');
    numbers = JSON.parse(data);
    if (!Array.isArray(numbers)) throw new Error();
  } catch {
    throw new Error('FS operation failed');
  }

  const numCores = os.cpus().length;
  const chunkSize = Math.ceil(numbers.length / numCores);
  const chunks = [];
  for (let i = 0; i < numCores; i++) {
    chunks.push(numbers.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  const workerPath = path.join(__dirname, 'worker.js');
  const promises = chunks.map(chunk =>
    new Promise((resolve, reject) => {
      const worker = new Worker(workerPath, { workerData: chunk });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', code => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
      });
    })
  );

  let sortedChunks;
  try {
    sortedChunks = await Promise.all(promises);
  } catch {
    throw new Error('Worker thread failed');
  }

  function kWayMerge(arrays) {
    const result = [];
    const indices = new Array(arrays.length).fill(0);

    while (true) {
      let minValue = null;
      let minIndex = -1;
      for (let i = 0; i < arrays.length; i++) {
        if (indices[i] < arrays[i].length) {
          if (minValue === null || arrays[i][indices[i]] < minValue) {
            minValue = arrays[i][indices[i]];
            minIndex = i;
          }
        }
      }
      if (minIndex === -1) break;
      result.push(minValue);
      indices[minIndex]++;
    }
    return result;
  }

  const finalSorted = kWayMerge(sortedChunks);

  console.log(finalSorted);
};

await main();