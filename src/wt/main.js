import fs from 'node:fs/promises';
import os from 'node:os';
import { Worker } from 'node:worker_threads';
import { splitArrayByNumberOfCores, keyMerge } from '../utils/util.js';

const main = async () => {
  const jsonFilepath = './data.json';
  const workerPath = process.cwd() + '/src/wt/worker.js';

  try {
    await fs.access(jsonFilepath);

    const content = await fs.readFile(jsonFilepath, { encoding: 'utf8' });
    const data = JSON.parse(content);
    const numberOfCores = os.cpus().length;
    const chunks = splitArrayByNumberOfCores(data, numberOfCores);

    const workerPromises = chunks.map((chunk) => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(workerPath);

        worker.postMessage({ data: chunk });

        worker.on('message', (data) => {
          resolve(data);
          worker.terminate();
        });
        
        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error('Worker Stopped!'));
          }
        });
      });
    });

    const sortedArr = await Promise.all(workerPromises);

    const result = keyMerge(sortedArr);
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
  }
};

await main();