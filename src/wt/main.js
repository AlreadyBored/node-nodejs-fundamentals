import { Worker } from "node:worker_threads";
import { readFile } from "node:fs/promises";
import { cpus } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const main = async () => {
  const dataPath = join(__dirname, "data.json");
  const raw = await readFile(dataPath, "utf-8");
  const numbers = JSON.parse(raw);

  const numCores = cpus().length;

  const chunkSize = Math.ceil(numbers.length / numCores);
  const chunks = [];
  for (let i = 0; i < numbers.length; i += chunkSize) {
    chunks.push(numbers.slice(i, i + chunkSize));
  }

  const workerPath = join(__dirname, "worker.js");

  const workerPromises = chunks.map((chunk, index) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(workerPath);

      worker.postMessage(chunk);

      worker.on("message", (sortedChunk) => {
        resolve(sortedChunk);
      });

      worker.on("error", reject);

      worker.on("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Worker ${index} exited with code ${code}`));
        }
      });
    });
  });

  const sortedChunks = await Promise.all(workerPromises);

  const merge = (arrays) => {
    const result = [];
    const pointers = new Array(arrays.length).fill(0);

    while (true) {
      let minVal = Infinity;
      let minIdx = -1;

      for (let i = 0; i < arrays.length; i++) {
        if (pointers[i] < arrays[i].length && arrays[i][pointers[i]] < minVal) {
          minVal = arrays[i][pointers[i]];
          minIdx = i;
        }
      }

      if (minIdx === -1) break;

      result.push(minVal);
      pointers[minIdx]++;
    }

    return result;
  };

  const sorted = merge(sortedChunks);

  console.log(sorted);
};

await main();
