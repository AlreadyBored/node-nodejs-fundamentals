import os from 'node:os'
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url'
import { Worker } from 'node:worker_threads'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataPath = path.join(__dirname, 'data.json')

const main = async () => {
  const raw = await fs.readFile(dataPath, 'utf8')
  const data = JSON.parse(raw)
  const numCPUs =os.cpus().length
  const chunkSize = Math.ceil(data.length / numCPUs)

  const chunks = []

  for (let i = 0; i < data.length; i += chunkSize){
    chunks.push(data.slice(i, i + chunkSize))
  }

  const workerPath = path.join(__dirname, 'worker.js')

  const results = await Promise.all(
    chunks.map((chunk, index) => new Promise((resolve, reject) => {
      const worker = new Worker(workerPath, { workerData: chunk });
      worker.on('message', resolve);
      worker.on('error', reject);
    }))
  );

  const merged = [];
  const arrays = results.map(arr => [...arr]);

  while (arrays.some(arr => arr.length > 0)) {
    let minIndex = -1;
    let minValue = Infinity;
    for (let i = 0; i < arrays.length; i++) {
      if (arrays[i].length === 0) continue;
      const value = arrays[i][0];
      if (value < minValue) {
        minValue = value;
        minIndex = i;
      }
    }
    merged.push(minValue);
    arrays[minIndex].shift();
  }

  console.log(merged);
};

await main();