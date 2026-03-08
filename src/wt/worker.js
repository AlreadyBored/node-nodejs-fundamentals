import { parentPort } from "node:worker_threads";

// Receive array from main thread
// Sort in ascending order
// Send back to main thread

parentPort.on("message", (data) => {
  // Check if data is actually an array
  if (!Array.isArray(data)) {
    return;
  }

  // Sorting in ascending order
  // We use (a, b) => a - b because the default sort()
  // treats numbers as strings (e.g., 10 comes before 2).
  const sortedArray = data.sort((a, b) => a - b);

  // Send the sorted result back to the main thread
  parentPort.postMessage(sortedArray);
});
