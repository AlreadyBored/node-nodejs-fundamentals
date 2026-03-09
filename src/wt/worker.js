import { parentPort } from 'node:worker_threads';

parentPort.on('message', (content) => {
  if (!Array.isArray(content.data)) {
    return;
  }

  const sortedArr = content.data.sort((a, b) => a - b);
  parentPort.postMessage(sortedArr); 
});
