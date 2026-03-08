import { parentPort } from 'worker_threads';

parentPort.on('message', data => {
  if (Array.isArray(data)) {
    const sortedArray = data.slice().sort((a, b) => a - b);
    parentPort.postMessage(sortedArray);
  } else {
    parentPort.postMessage({ error: 'Data must be an array of numbers' });
  }
});
