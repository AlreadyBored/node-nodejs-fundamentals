import { parentPort, workerData } from 'worker_threads';

if (workerData) {
  const sorted = Array.isArray(workerData)
    ? [...workerData].sort((a, b) => a - b)
    : [];
  parentPort.postMessage(sorted);
}

parentPort.on('message', (data) => {
  if (Array.isArray(data)) {
    const sorted = [...data].sort((a, b) => a - b);
    parentPort.postMessage(sorted);
  }
});