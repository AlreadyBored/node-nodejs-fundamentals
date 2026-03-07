const main = async () => {
  // Write your code here
  // Read data.json containing array of numbers
  // Split into N chunks (N = CPU cores)
  // Create N workers, send one chunk to each
  // Collect sorted chunks
  // Merge using k-way merge algorithm
  // Log final sorted array
  const dataPath = path.join(__dirname, "data.json");
  const workerPath = path.join(__dirname, "worker.js");

  const raw = await fs.readFile(dataPath, "utf-8");
  const numbers = JSON.parse(raw);

  const cpuCount = os.cpus().length;
  const chunkCount = Math.min(cpuCount, numbers.length || 1);
  const chunkSize = Math.ceil(numbers.length / chunkCount);

  const chunks = [];

  for (let i = 0; i < chunkCount; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    chunks.push(numbers.slice(start, end));
  }

  const sortedChunks = await Promise.all(
    chunks.map(
      (chunk) =>
        new Promise((resolve, reject) => {
          const worker = new Worker(workerPath, { type: "module" });

          worker.once("message", (sortedChunk) => resolve(sortedChunk));
          worker.once("error", reject);
          worker.once("exit", (code) => {
            if (code !== 0) {
              reject(new Error(`Worker stopped with exit code ${code}`));
            }
          });

          worker.postMessage(chunk);
        }),
    ),
  );

  const merged = mergeKWay(sortedChunks);

  console.log(merged);
};

const mergeKWay = (arrays) => {
  const indices = new Array(arrays.length).fill(0);
  const result = [];

  while (true) {
    let minValue = Infinity;
    let minArrayIndex = -1;

    for (let i = 0; i < arrays.length; i++) {
      const currentIndex = indices[i];

      if (currentIndex < arrays[i].length) {
        const value = arrays[i][currentIndex];

        if (value < minValue) {
          minValue = value;
          minArrayIndex = i;
        }
      }
    }

    if (minArrayIndex === -1) {
      break;
    }

    result.push(minValue);
    indices[minArrayIndex]++;
  }

  return result;
};

await main();
