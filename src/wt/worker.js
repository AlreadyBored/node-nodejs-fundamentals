import { parentPort } from 'worker_threads';

parentPort.on('message', (numbers) => {
  if (Array.isArray(numbers)) {
    numbers.sort((a, b) => a - b);
    parentPort.postMessage(numbers);
  }
});