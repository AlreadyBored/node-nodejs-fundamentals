import { createReadStream } from "fs";
import { readFile } from "node:fs/promises";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { resolve } from "path";
import { dirname, join } from "path";

const calculateHash = (file) =>
  new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(file);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });

const verify = async () => {
  try {
    //checksums.json and test files should be in the root like node-nodejs-fundamentals/checksums.json
    const projectRoot = process.cwd();
    const data = await readFile(join(projectRoot, "checksums.json"), "utf8");
    const checksumsContent = JSON.parse(data);

    for (const [filename, expectedHash] of Object.entries(checksumsContent)) {
      try {
        const filePath = join(projectRoot, filename);
        const actualHash = await calculateHash(filePath);
        const result = actualHash === expectedHash ? "OK" : "FAIL";
        console.log(`${filename} — ${result}`);
      } catch {
        console.log(`${filename} — FAIL`);
      }
    }
  } catch {
    throw new Error("FS operation failed");
  }
};

await verify();
