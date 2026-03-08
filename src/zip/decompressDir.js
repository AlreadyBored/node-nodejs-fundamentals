import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { createBrotliDecompress } from "node:zlib";

const pipe = promisify(pipeline);

const decompressDir = async () => {
  // Write your code here
  // Read archive.br from workspace/compressed/
  // Decompress and extract to workspace/decompressed/
  // Use Streams API
  const input = path.join("workspace", "compressed", "archive.br");
  const outputDir = path.join("workspace", "decompressed");
  fs.mkdirSync(outputDir, { recursive: true });

  const decompress = createBrotliDecompress();
  const output = fs.createWriteStream(path.join(outputDir, "restoredFile.txt"));

  await pipe(fs.createReadStream(input), decompress, output);

  console.log("Decompression done");
};

await decompressDir();
