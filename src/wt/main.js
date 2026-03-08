import { Worker } from "node:worker_threads";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const main = async () => {
  const dataPath = path.join(__dirname, "..", "..", "data.json");
  const raw = await readFile(dataPath, "utf-8");
  const numbers = JSON.parse(raw);

  const cpuCount = os.cpus().length;
  const chunkSize = Math.ceil(numbers.length / cpuCount);

  const chunks = [];
  for (let i = 0; i < numbers.length; i += chunkSize) {
    chunks.push(numbers.slice(i, i + chunkSize));
  }

  const sortedChunks = await Promise.all(
    chunks.map((chunk, i) => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, "worker.js"));
        worker.postMessage(chunk);
        worker.on("message", resolve);
        worker.on("error", reject);
      });
    }),
  );

  const result = [];
  const indices = new Array(sortedChunks.length).fill(0);

  while (true) {
    let minVal = Infinity;
    let minIdx = -1;

    for (let i = 0; i < sortedChunks.length; i++) {
      if (
        indices[i] < sortedChunks[i].length &&
        sortedChunks[i][indices[i]] < minVal
      ) {
        minVal = sortedChunks[i][indices[i]];
        minIdx = i;
      }
    }

    if (minIdx === -1) break;

    result.push(minVal);
    indices[minIdx]++;
  }

  console.log(result);
};

await main();
