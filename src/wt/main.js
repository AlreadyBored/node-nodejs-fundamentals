import { Worker } from "node:worker_threads";
import { cpus } from "node:os";
import { join } from "node:path";

const __dirname = import.meta.dirname;

function runWorker(chunk, index) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(join(__dirname, "worker.js"));
    worker.postMessage(chunk);

    worker.on("message", (result) => {
      worker.terminate();
      resolve({ result, index });
    });

    worker.on("error", (err) => {
      worker.terminate();
      reject(err);
    });
  });
}

function mergeTwoArray(arr1, arr2) {
  const result = [];
  let i = 0;
  let j = 0;

  while (i < arr1.length && j < arr2.length) {
    if (arr1[i] < arr2[j]) {
      result.push(arr1[i++]);
    } else {
      result.push(arr2[j++]);
    }
  }

  return [...result, ...arr1.slice(i), ...arr2.slice(j)];
}

function mergeKArrays(arrays) {
  if (arrays.length === 0) return [];

  let lists = [...arrays];

  while (lists.length > 1) {
    const mergedPairs = [];

    for (let i = 0; i < lists.length; i += 2) {
      const list1 = lists[i];
      const list2 = lists[i + 1];

      if (list2 === undefined) {
        mergedPairs.push(list1);
      } else {
        mergedPairs.push(mergeTwoArray(list1, list2));
      }
    }
    lists = mergedPairs;
  }

  return lists[0];
}

const main = async () => {
  const array = [
    1, 4, 3, 7, 5, 8, 4, 6, 5, 7, 6, 5, 8, 6, 5, 7, 5, 2, 9, 7, 9, 4, 4, 5, 6,
    3,
  ];

  const resultArrayPromises = [];
  const cpuCount = cpus().length;

  let n = cpuCount;
  let i = 0;
  while (n > 0) {
    const size = Math.ceil(array.length / n);
    const chunkArray = array.splice(0, size);
    resultArrayPromises.push(runWorker(chunkArray, i++));

    n--;
  }

  const workerResults = await Promise.all(resultArrayPromises);

  const sortedChunks = new Array(workerResults.length);

  for (const chunk of workerResults) {
    sortedChunks[chunk.index] = chunk.result;
  }

  console.log(mergeKArrays(sortedChunks));
};

await main();
