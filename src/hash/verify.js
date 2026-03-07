import { createReadStream } from "node:fs";
import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const verify = async () => {
  const checksumsPath = join(__dirname, "checksums.json");

  try {
    await access(checksumsPath);
  } catch {
    throw new Error("FS operation failed");
  }

  const raw = await readFile(checksumsPath, "utf-8");
  const checksums = JSON.parse(raw);

  for (const [fileName, expectedHash] of Object.entries(checksums)) {
    const filePath = join(__dirname, fileName);
    const hash = createHash("sha256");
    const fileStream = createReadStream(filePath);

    await pipeline(fileStream, hash);

    const actualHash = hash.digest("hex");
    const status = actualHash === expectedHash ? "OK" : "FAIL";
    console.log(`${fileName} — ${status}`);
  }
};

await verify();
