import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createReadStream } from "fs";
import { createHash } from "crypto";

const verify = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  let data;

  try {
    data = await readFile(join(__dirname, "checksums.json"), "utf8");
  } catch {
    throw new Error("FS operation failed");
  }

  const checksums = JSON.parse(data);
  const entries = Object.entries(checksums);

  for (const [filename, expectedHash] of entries) {
    const actualHash = await new Promise((resolve, reject) => {
      const hash = createHash("sha256");
      const stream = createReadStream(join(__dirname, filename));

      stream.on("data", (chunk) => {
        hash.update(chunk);
      });

      stream.on("end", () => {
        resolve(hash.digest("hex"));
      });

      stream.on("error", reject);
    });

    if (actualHash === expectedHash) {
      console.log(`${filename} — OK`);
    } else {
      console.log(`${filename} — FAIL`);
    }
  }
};

await verify();