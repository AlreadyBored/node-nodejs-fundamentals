import { readFile } from "fs/promises";
import { createReadStream } from "fs";
import { createHash } from "crypto";

const checkFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const fileStream = createReadStream(filePath);
    fileStream.on("data", (chunk) => {
      hash.update(chunk);
    });
    fileStream.on("end", () => {
      resolve(hash.digest("hex"));
    });
    fileStream.on("error", (err) => {
      reject(err);
    });
  });
};

const verify = async () => {
  let text = "";
  try {
    text = await readFile("./src/hash/checksums.json", "utf-8");
  } catch {
    throw new Error("FS operation failed");
  }

  const checksums = JSON.parse(text);
  const fileNames = Object.keys(checksums);

  for (const fileName of fileNames) {
    const expectedHash = checksums[fileName];
    const actualHash = await checkFile(`./src/hash/${fileName}`);

    if (actualHash === expectedHash) {
      console.log(`${fileName} — OK`);
    } else {
      console.log(`${fileName} — FAIL`);
    }
  }
};

await verify();
