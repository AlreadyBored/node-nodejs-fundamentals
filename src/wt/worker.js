import { parentPort, workerData } from 'node:worker_threads';

const sortChunk = (arr) => {
  return [...arr].sort((a, b) => a - b);
};

const sorted = sortChunk(workerData.chunk);
parentPort.postMessage(sorted);
