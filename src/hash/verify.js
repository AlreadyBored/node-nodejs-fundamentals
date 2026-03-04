import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { createHash } from "crypto";
import { createReadStream } from "fs";

const verify = async () => {
  const fileUrl = fileURLToPath(import.meta.url);
  const appPath = path.dirname(fileUrl);
  const checksumsPath = path.resolve(appPath, "checksums.json");

  try {
    await fs.access(checksumsPath);

    const data = await fs.readFile(checksumsPath, "utf-8");
    const checksums = JSON.parse(data);

    for (const [filename, expectedHash] of Object.entries(checksums)) {
      const filePath = path.resolve(appPath, filename);

      const actualHash = await new Promise((resolve, reject) => {
        const hash = createHash("sha256");
        const stream = createReadStream(filePath);

        stream.on("error", reject);

        stream.on("data", (chunk) => {
          hash.update(chunk);
        });

        stream.on("end", () => {
          resolve(hash.digest("hex"));
        });
      });
      const result = actualHash === expectedHash ? "OK" : "Fail";
      console.log(`${filename} - ${result}`);
    }
  } catch (error) {
    throw new Error("FS operation failed");
  }
};

await verify();
