import { Worker } from "node:worker_threads";
import fs from "node:fs/promises";
import os from "node:os";

const main = async () => {
  // Write your code here
  // Read data.json containing array of numbers
  // Split into N chunks (N = CPU cores)
  // Create N workers, send one chunk to each
  // Collect sorted chunks
  // Merge using k-way merge algorithm
  // Log final sorted array
  const data = JSON.parse(await fs.readFile("data.json", "utf8"));
  const cores = os.cpus().length;
  const chunkSize = Math.ceil(data.length / cores);

  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }

  const workers = chunks.map(
    (chunk) =>
      new Promise((resolve, reject) => {
        const worker = new Worker(new URL("./worker.js", import.meta.url));
        worker.on("message", resolve);
        worker.on("error", reject);
        worker.postMessage(chunk);
      }),
  );

  const sortedChunks = await Promise.all(workers);

  const result = [];
  const pointers = Array(sortedChunks.length).fill(0);

  while (true) {
    let min = Infinity;
    let minIdx = -1;
    for (let i = 0; i < sortedChunks.length; i++) {
      if (
        pointers[i] < sortedChunks[i].length &&
        sortedChunks[i][pointers[i]] < min
      ) {
        min = sortedChunks[i][pointers[i]];
        minIdx = i;
      }
    }
    if (minIdx === -1) break;
    result.push(min);
    pointers[minIdx]++;
  }

  console.log(result);
};

await main();
