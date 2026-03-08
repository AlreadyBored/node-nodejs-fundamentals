import { Worker } from "node:worker_threads";
import path from "node:path";
import { getFileContent } from "../lib/utils.js";
import os from "os";

const cpuCount = os.availableParallelism();

const createWorker = (path, chunk) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path);
    worker.postMessage(chunk);

    worker.on("message", (sortedChunk) => {
      resolve(sortedChunk);
    });

    worker.on("error", (error) => {
      reject(error);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};

// non most effective k-way merge, but who cares?
function kWayMerge(arrays) {
  const result = [];
  const pointers = new Array(arrays.length).fill(0);

  while (true) {
    let minValue = Infinity;
    let minArrayIndex = -1;

    for (let i = 0; i < arrays.length; i++) {
      const pointer = pointers[i];

      if (pointer < arrays[i].length) {
        const value = arrays[i][pointer];

        if (value < minValue) {
          minValue = value;
          minArrayIndex = i;
        }
      }
    }

    if (minArrayIndex === -1) break;

    result.push(minValue);
    pointers[minArrayIndex]++;
  }

  return result;
}

const main = async () => {
  // Write your code here
  // Read data.json containing array of numbers
  // Split into N chunks (N = CPU cores)
  // Create N workers, send one chunk to each
  // Collect sorted chunks
  // Merge using k-way merge algorithm
  // Log final sorted array

  const data = await getFileContent(path.resolve("data.json"));
  const numbers = data ? JSON.parse(data) : [];
  const chunkSize = Math.ceil(numbers.length / cpuCount);
  const chunks = [];

  for (let i = 0; i < numbers.length; i += chunkSize) {
    chunks.push(numbers.slice(i, i + chunkSize));
  }

  const sortedChunks = await Promise.all(
    chunks.map((chunk) => createWorker(path.resolve("src/wt/worker.js"), chunk))
  );
  const sortedNumbers = kWayMerge(sortedChunks);
  console.log(sortedNumbers);
};

await main();
