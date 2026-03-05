import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fsPromises from "fs/promises";
import { pipeline } from "node:stream/promises";
import { isFolderExists as isFileExists } from "../lib/utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const verify = async () => {
  // Write your code here
  // Read checksums.json
  // Calculate SHA256 hash using Streams API
  // Print result: filename — OK/FAIL

  const checksumPath = path.join(__dirname, "checksums.json");

  const isFileExist = await isFileExists(checksumPath);

  if (!isFileExist) {
    throw new Error("FS operation failed");
  }

  const checksums = JSON.parse(
    await fsPromises.readFile(checksumPath, "utf-8"),
  );

  for (const [file, hash] of Object.entries(checksums)) {
    const hashStream = createHash("sha256");
    const fileStream = createReadStream(path.join(__dirname, file));

    await pipeline(fileStream, hashStream);

    const calculatedHash = hashStream.digest("hex");

    if (calculatedHash === hash) {
      console.log(`${file} — OK`);
    } else {
      console.log(`${file} — FAIL`);
    }
  }
};

await verify();
