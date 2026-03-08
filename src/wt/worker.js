import { parentPort } from 'worker_threads';

// Receive array from main thread
// Sort in ascending order
// Send back to main thread

parentPort.on('message', (data) => {
  if (Array.isArray(data)) {
    const sorted = [...data].sort((a, b) => a - b);
    parentPort.postMessage(sorted);
  }
});
