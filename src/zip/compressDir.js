import fs from "node:fs";
import path from "node:path";
import { createBrotliCompress } from "node:zlib";

const compressDir = async () => {
  // Write your code here
  // Read all files from workspace/toCompress/
  // Compress entire directory structure into archive.br
  // Save to workspace/compressed/
  // Use Streams API
  const inputDir = path.join("workspace", "toCompress");
  const outputDir = path.join("workspace", "compressed");
  fs.mkdirSync(outputDir, { recursive: true });

  const output = fs.createWriteStream(path.join(outputDir, "archive.br"));
  const compress = createBrotliCompress();
  compress.pipe(output);

  const files = fs.readdirSync(inputDir);
  for (const file of files) {
    const data = fs.readFileSync(path.join(inputDir, file));
    compress.write(data);
  }

  compress.end();
  compress.on("finish", () => console.log("Compression done"));
};

await compressDir();
