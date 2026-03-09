import { parentPort } from 'worker_threads';

parentPort.on('message', (data) => {
  parentPort.postMessage([...data].sort((a, b) => a - b));
});
