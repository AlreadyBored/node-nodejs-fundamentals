import { createReadStream } from "fs";
import { readFile } from "node:fs/promises";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
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
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const filePath = join(__dirname, "checksums.json");

    const data = await readFile(filePath, "utf8");
    const checksumsContent = JSON.parse(data);

    for (const [filename, expectedHash] of Object.entries(checksumsContent)) {
      try {
        const filePath = join(__dirname, filename);
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
