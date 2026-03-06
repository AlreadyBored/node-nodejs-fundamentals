import { Worker } from "worker_threads";
import { readFile } from "fs/promises";
import { cpus } from "os";
import { resolve as pathResolve } from "path";

async function sortLargeArray() {
  // data.json should be in the root

  const filePath = pathResolve("data.json");
  const data = await readFile(filePath, "utf-8");
  const numbers = JSON.parse(data);
  const numCores = cpus().length;

  const chunkSize = Math.ceil(numbers.length / numCores);
  const chunks = [];
  for (let i = 0; i < numbers.length; i += chunkSize) {
    chunks.push(numbers.slice(i, i + chunkSize));
  }

  const workers = chunks.map((chunk) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(pathResolve("./src/wt/worker.js"));
      worker.postMessage(chunk);

      worker.on("message", (sortedChunk) => {
        resolve(sortedChunk);
      });

      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  });

  const sortedChunks = await Promise.all(workers);
  const merged = kWayMerge(sortedChunks);
  console.log(merged);
}

function kWayMerge(arrays) {
  const result = [];
  const pointers = new Array(arrays.length).fill(0);

  while (true) {
    let minVal = Infinity;
    let minIndex = -1;

    for (let i = 0; i < arrays.length; i++) {
      const pointer = pointers[i];
      if (pointer < arrays[i].length) {
        if (arrays[i][pointer] < minVal) {
          minVal = arrays[i][pointer];
          minIndex = i;
        }
      }
    }

    if (minIndex === -1) break;

    result.push(minVal);
    pointers[minIndex]++;
  }

  return result;
}

sortLargeArray().catch(console.error);
