import { readFile } from "fs/promises";
import { createReadStream } from "fs";
import { createHash } from "crypto";
import { pipeline } from "stream/promises";
import path from "path";

const calculateHash = async (filePath) => {
  try {
    const hash = createHash("sha256");
    const fileStream = createReadStream(filePath);
    await pipeline(fileStream, hash);
    return hash.digest("hex");
  } catch {
    return null;
  }
};

const verify = async () => {
  const checksumsPath = path.resolve("./src/hash/checksums.json");
  let content;

  try {
    content = await readFile(checksumsPath, "utf-8");
  } catch {
    throw new Error("FS operation failed");
  }

  const data = JSON.parse(content);

  for (const [fileName, expectedHash] of Object.entries(data)) {
    const filePath = path.resolve(`./src/hash/${fileName}`);
    const actualHash = await calculateHash(filePath);

    if (actualHash === expectedHash) {
      console.log(`${fileName} — OK`);
    } else {
      console.log(`${fileName} — FAIL`);
    }
  }
};

await verify();
