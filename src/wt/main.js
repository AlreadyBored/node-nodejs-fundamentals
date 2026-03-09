import { cpus } from 'node:os';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';

const createChunks = (numbers, chunkCount) => {
  const chunks = Array.from({ length: chunkCount }, () => []);

  for (let index = 0; index < numbers.length; index += 1) {
    chunks[index % chunkCount].push(numbers[index]);
  }

  return chunks;
};

const runWorker = (workerPath, chunk) => new Promise((resolve, reject) => {
  const worker = new Worker(workerPath);

  worker.once('message', (sortedChunk) => {
    resolve(sortedChunk);
    worker.terminate();
  });

  worker.once('error', reject);

  worker.once('exit', (code) => {
    if (code !== 0) {
      reject(new Error(`Worker stopped with exit code ${code}`));
    }
  });

  worker.postMessage(chunk);
});

const mergeSortedChunks = (sortedChunks) => {
  const merged = [];
  const indexes = Array.from({ length: sortedChunks.length }, () => 0);

  while (true) {
    let candidateChunkIndex = -1;

    for (let chunkIndex = 0; chunkIndex < sortedChunks.length; chunkIndex += 1) {
      const currentIndex = indexes[chunkIndex];
      if (currentIndex >= sortedChunks[chunkIndex].length) {
        continue;
      }

      if (candidateChunkIndex === -1) {
        candidateChunkIndex = chunkIndex;
        continue;
      }

      if (sortedChunks[chunkIndex][currentIndex] < sortedChunks[candidateChunkIndex][indexes[candidateChunkIndex]]) {
        candidateChunkIndex = chunkIndex;
      }
    }

    if (candidateChunkIndex === -1) {
      return merged;
    }

    merged.push(sortedChunks[candidateChunkIndex][indexes[candidateChunkIndex]]);
    indexes[candidateChunkIndex] += 1;
  }
};

const main = async () => {
  // Write your code here
  // Read data.json containing array of numbers
  // Split into N chunks (N = CPU cores)
  // Create N workers, send one chunk to each
  // Collect sorted chunks
  // Merge using k-way merge algorithm
  // Log final sorted array
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);
  const dataPath = path.resolve(currentDir, '../../data.json');
  const workerPath = path.resolve(currentDir, './worker.js');

  try {
    const rawData = await readFile(dataPath, 'utf8');
    const numbers = JSON.parse(rawData);

    if (!Array.isArray(numbers) || !numbers.every((item) => typeof item === 'number')) {
      throw new Error('Invalid input data');
    }

    const workerCount = cpus().length;
    const chunks = createChunks(numbers, workerCount);
    const sortedChunks = await Promise.all(chunks.map((chunk) => runWorker(workerPath, chunk)));
    const sortedNumbers = mergeSortedChunks(sortedChunks);

    console.log(sortedNumbers);
  } catch {
    throw new Error('WT operation failed');
  }
};

await main();
