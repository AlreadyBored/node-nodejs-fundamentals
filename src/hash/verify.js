import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const verify = async () => {
  const checksumsPath = path.join(__dirname, "checksums.json");

  const checksumExists = await fs
    .access(checksumsPath)
    .then(() => true)
    .catch(() => false);

  if (!checksumExists) throw new Error("FS operation failed");

  const checksumFile = await fs.readFile(checksumsPath, "utf-8");
  const checksumsObj = JSON.parse(checksumFile);

  for (const [fileName, expectedHash] of Object.entries(checksumsObj)) {
    const filePath = path.join(__dirname, fileName);
    const hash = createHash("sha256");
    const fileStream = createReadStream(filePath);

    await pipeline(fileStream, hash);

    const actualHash = hash.digest("hex");
    const status = actualHash === expectedHash ? "OK" : "FAIL";
    console.log(`${fileName} — ${status}`);
  }
};

await verify();
