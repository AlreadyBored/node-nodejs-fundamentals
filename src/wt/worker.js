import { parentPort } from 'worker_threads';

parentPort.on('message', (data) => {
  if (Array.isArray(data)) {
    const sorted = data.sort((a, b) => a - b);
    parentPort.postMessage(sorted);
  } else {
    parentPort.postMessage([]);
  }
});
