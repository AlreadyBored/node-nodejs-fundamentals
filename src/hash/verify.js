import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { resolve, join } from "node:path";
import { pipeline } from "node:stream/promises";

// Write your code here
// Read checksums.json
// Calculate SHA256 hash using Streams API
// Print result: filename — OK/FAIL

const verify = async () => {
  const checksumsPath = resolve(process.cwd(), "checksums.json");
  const workspacePath = resolve(process.cwd(), "workspace");

  try {
    // 1. Initial validation: Ensure checksums.json exists
    try {
      await stat(checksumsPath);
    } catch {
      // Required error message if the file is missing
      throw new Error("FS operation failed");
    }

    // 2. Load the expected hashes from the JSON file
    const rawData = await readFile(checksumsPath, "utf-8");
    const checksums = JSON.parse(rawData);

    // 3. Process each file entry in the JSON
    for (const [fileName, expectedHash] of Object.entries(checksums)) {
      const filePath = join(workspacePath, fileName);

      try {
        // We create a Hash transform stream for SHA256
        const hash = createHash("sha256");
        // We open a readable stream for the file
        const fileStream = createReadStream(filePath);

        //
        // Pipeline connects the file to the hash calculator and waits for it to finish
        await pipeline(fileStream, hash);

        // Calculate the final hexadecimal hash string
        const actualHash = hash.digest("hex");

        // 4. Verification and Output
        const isMatch = actualHash === expectedHash;
        const status = isMatch ? "OK" : "FAIL";

        process.stdout.write(`${fileName} — ${status}\n`);
      } catch {
        // If a file listed in the JSON doesn't exist, we print FAIL
        process.stdout.write(`${fileName} — FAIL\n`);
      }
    }
  } catch (error) {
    // Standard error for missing JSON or other critical FS failures
    throw new Error("FS operation failed");
  }
};

await verify();
