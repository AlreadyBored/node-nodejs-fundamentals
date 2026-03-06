import { parentPort } from "worker_threads";

parentPort.on("message", (data) => {
  if (Array.isArray(data)) {
    const copy = [...data];
    const sorted = copy.sort((a, b) => a - b);

    parentPort.postMessage(sorted);
  } else {
    parentPort.postMessage({ error: "Expected an array of numbers" });
  }
});
