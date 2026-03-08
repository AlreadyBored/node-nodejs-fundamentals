import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";

const __dirname = import.meta.dirname;

const verify = async () => {
  const checksums = JSON.parse(
    await readFile(join(__dirname, "checksums.json")).catch((err) => {
      if (err.code === "ENOENT") {
        throw new Error("FS operation failed");
      }

      throw err;
    }),
  );

  for (const fileName in checksums) {
    const hash = createHash("sha256");
    const stream = createReadStream(join(__dirname, fileName));

    await pipeline(stream, hash);

    const finalHash = hash.digest("hex");

    finalHash === checksums[fileName]
      ? console.log(`${fileName} — OK`)
      : console.log(`${fileName} — FAIL`);
  }
};

await verify();
