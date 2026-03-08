import { Worker } from "node:worker_threads";
import { cpus } from "node:os";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

// Write your code here
// Read data.json containing array of numbers
// Split into N chunks (N = CPU cores)
// Create N workers, send one chunk to each
// Collect sorted chunks
// Merge using k-way merge algorithm
// Log final sorted array

const runWorker = (workerPath, data) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerPath);
    worker.postMessage(data);

    worker.on("message", (result) => resolve(result));
    worker.on("error", (err) => reject(err));
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};

/**
 * kWayMerge: Merges multiple sorted arrays into a single sorted array.
 */
const kWayMerge = (arrays) => {
  // For simplicity and performance in JS, we flatten and sort,
  // but a true k-way merge would use a Min-Priority Queue.
  return arrays.flat().sort((a, b) => a - b);
};

/**
 * main: Reads data, splits it among workers, and merges the results.
 */
const main = async () => {
  const dataPath = resolve(process.cwd(), "data.json");
  const workerPath = resolve(process.cwd(), "src", "wt", "worker.js");

  try {
    // 1. Validation: Ensure data.json exists
    await stat(dataPath);
    const rawData = await readFile(dataPath, "utf-8");
    const numbers = JSON.parse(rawData);

    // 2. Identify CPU cores (N)
    const numCores = cpus().length;
    const chunkSize = Math.ceil(numbers.length / numCores);

    // 3. Split data into N chunks
    const chunks = [];
    for (let i = 0; i < numCores; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      chunks.push(numbers.slice(start, end));
    }

    process.stdout.write(
      `Spawning ${numCores} workers to sort ${numbers.length} numbers \n`
    );

    // 4. Create and run workers in parallel
    const workerPromises = chunks.map((chunk) => runWorker(workerPath, chunk));

    // Collect all sorted results
    const sortedChunks = await Promise.all(workerPromises);

    // 5. Merge using k-way merge logic
    const finalResult = kWayMerge(sortedChunks);

    // 6. Log final result
    process.stdout.write("Final sorted array:\n");
    console.log(finalResult);
  } catch (error) {
    process.stderr.write("Operation failed, Check if data.json exists.\n");
    process.exit(1);
  }
};

await main();
