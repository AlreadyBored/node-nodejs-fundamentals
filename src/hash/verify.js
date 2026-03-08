import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const verify = async () => {
  // Write your code here
  // Read checksums.json
  // Calculate SHA256 hash using Streams API
  // Print result: filename — OK/FAIL
  const checksums = JSON.parse(
    await fs.promises.readFile("checksums.json", "utf8"),
  );

  for (const item of checksums) {
    const filePath = path.join("workspace", item.file);
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    await new Promise((resolve, reject) => {
      stream.on("data", (chunk) => hash.update(chunk));
      stream.on("end", () => resolve());
      stream.on("error", reject);
    });

    const digest = hash.digest("hex").toLowerCase();
    if (digest === item.hash.toLowerCase()) {
      console.log(`${item.file} — OK`);
    } else {
      console.log(`${item.file} — FAIL`);
    }
  }
};

await verify();
