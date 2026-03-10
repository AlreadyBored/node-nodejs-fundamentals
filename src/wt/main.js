import { readFile } from "fs/promises";
import path from "path";
import { isMainThread, parentPort, Worker } from "worker_threads";
import os from "os";

function sortArrays(chunks) {
  const result = [];
  const indexes = new Array(chunks.length).fill(0);

  while (true) {
    let minValue = Infinity;
    let minChunk = -1;

    for (let i = 0; i < chunks.length; i++) {
      const idx = indexes[i];

      if (idx < chunks[i].length && chunks[i][idx] < minValue) {
        minValue = chunks[i][idx];
        minChunk = i;
      }
    }

    if (minChunk === -1) break;

    result.push(minValue);
    indexes[minChunk]++;
  }
  return result;
}

const main = async () => {


  if (isMainThread) {
    const dataJson = await readFile(
      path.join(process.cwd(), "src/wt/data.json"),
      { encoding: "utf-8" },
    );
    const arr = JSON.parse(dataJson).array;
    const cpuCount = os.cpus().length;
    const sizeArr = Math.floor(arr.length / cpuCount);
    let rem = arr.length % cpuCount;
    const arrays = [];
    const arraysSort = [];
    for (let i = 0; i < cpuCount; i++) {
      arrays.push(
        arr.slice(i * sizeArr, (i + 1) * sizeArr + (rem > 0 ? 1 : 0)),
      );
      rem--;
    }
    let completed = 0;
    for (let i = 0; i < arrays.length; i++) {
      const worker = new Worker(path.join(process.cwd(), "src/wt/worker.js"));
      worker.on("message", (msg) => {
        arraysSort[i] = msg;
        completed++;
        if (completed >= cpuCount) {
          console.log(sortArrays(arraysSort));
        }
      });
      worker.postMessage(arrays[i]);
    }
  } else {
    parentPort.postMessage("hello");
    console.log("no main");
  }
};

await main();
