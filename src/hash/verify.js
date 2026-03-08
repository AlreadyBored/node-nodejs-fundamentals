import { createReadStream, createWriteStream } from "fs";
import { readFile, access } from "fs/promises";
import { createHash } from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const directoryName = dirname(fileURLToPath(import.meta.url));

const verify = async () => {
  const checksumsPath = join(directoryName, "checksums.json");

  await access(checksumsPath).catch(() => {
    throw new Error("FS operation failed");
  });

  const raw = await readFile(checksumsPath, "utf-8");
  const checksums = JSON.parse(raw);

  for (const [filename, expectedHash] of Object.entries(checksums)) {
    const filePath = join(directoryName, filename);

    const actualHash = await new Promise((resolve, reject) => {
      const hash = createHash("sha256");
      const stream = createReadStream(filePath);

      stream.on("data", (chunk) => hash.update(chunk));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", reject);
    });

    const status = actualHash === expectedHash ? "OK" : "FAIL";
    console.log(`${filename} — ${status}`);
  }
};

await verify();
