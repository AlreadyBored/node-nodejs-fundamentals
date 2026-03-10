import fs from "fs";
import path from "path";

const chunkArrays = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const split = async () => {
  // Write your code here
  // Read source.txt using Readable Stream
  // Split into chunk_1.txt, chunk_2.txt, etc.
  // Each chunk max N lines (--lines CLI argument, default: 10)

  const readStream = fs.createReadStream(
    path.join(process.cwd(), "src", "streams", "source.txt"),
    "utf-8",
  );
  readStream.on("data", (chunk) => {
    const indexParam = process.argv.indexOf("--lines");
    const countLines = process.argv[indexParam + 1] || 5;
    const lines = chunk.split("\n");
    const arrays = chunkArrays(lines, countLines);
    for (let i = 0; i < arrays.length; i++) {
      fs.writeFileSync(
        path.join(process.cwd(), "src/streams", `chunk_${i + 1}.txt`),
        arrays[i].join("\n"),
      );
    }
    console.log(arrays);
  });
  readStream.on("end", () => {
    console.log("File reading finish");
  });
};

await split();
