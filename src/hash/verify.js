import fs from "fs/promises";
import fs2 from "fs";
import crypto from "crypto";
import path from "path";

const verify = async () => {
  // Write your code here
  // Read checksums.json
  // Calculate SHA256 hash using Streams API
  // Print result: filename — OK/FAIL

  function calculateHash(filePath) {
    return new Promise((resolve, reject) => {
      if (!fs2.existsSync(filePath)) {
        resolve({ file: filePath, error: "File does not exist" });
        return;
      }
      const hash = crypto.createHash("sha256");
      const stream = fs2.createReadStream(filePath);
      stream.on("data", (data) => hash.update(data));
      stream.on("end", () => {
        const result = hash.digest("hex");
        resolve({ file: filePath, hash: result });
      });
      stream.on("error", (err) => reject(err));
    });
  }

  try {
    const content = await fs.readFile("src/hash/checksums.json", "utf-8");
    const files = JSON.parse(content);
    for (const file in files) {
      const fullPath = path.join(process.cwd(), "src/hash", file);
      const result = await calculateHash(fullPath);
      if (result.error) {
        console.log(`${file} — ${result.error}`);
      } else {
        const expectedHash = files[file];
        console.log(
          `${file} — ${result.hash === expectedHash ? "OK" : "FAIL"}`,
        );
      }
    }
  } catch (e) {
    console.error("FS operation failed");
  }
};
verify();
