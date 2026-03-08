import { createBrotliDecompress } from "node:zlib";
import { createReadStream } from "node:fs";
import { writeFile, mkdir, stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { resolve, join, dirname } from "node:path";

// Write your code here
// Read archive.br from workspace/compressed/
// Decompress and extract to workspace/decompressed/
// Use Streams API

/**
 * decompressDir: Reads a Brotli compressed archive and restores
 * the original directory and file structure.
 */
const decompressDir = async () => {
  const archivePath = resolve(
    process.cwd(),
    "workspace",
    "compressed",
    "archive.br"
  );
  const outputDir = resolve(process.cwd(), "workspace", "decompressed");

  try {
    // 1. Validation: Ensure archive exists
    try {
      await stat(archivePath);
    } catch {
      throw new Error("FS operation failed");
    }

    // 2. Prepare decompression stream
    const decompressor = createBrotliDecompress();
    const source = createReadStream(archivePath);

    // 3. Collect the data into a buffer/string
    let decompressedData = "";

    // We can use a special stream to collect the output
    const dataCollector = async (stream) => {
      for await (const chunk of stream) {
        decompressedData += chunk.toString();
      }
    };

    //
    // Pipeline: source -> decompressor
    await pipeline(source, decompressor, async function* (sourceStream) {
      for await (const chunk of sourceStream) {
        decompressedData += chunk.toString();
      }
    });

    // 4. Parse the recovered structure
    const { entries } = JSON.parse(decompressedData);

    // 5. Recreate files and folders
    for (const entry of entries) {
      const fullPath = join(outputDir, entry.path);

      if (entry.type === "directory") {
        await mkdir(fullPath, { recursive: true });
      } else {
        await mkdir(dirname(fullPath), { recursive: true });
        const contentBuffer = Buffer.from(entry.content, "base64");
        await writeFile(fullPath, contentBuffer);
      }
    }

    process.stdout.write("Archive decompressed successfully! \n");
  } catch (error) {
    process.stderr.write("FS operation failed\n");
    process.exit(1);
  }
};

await decompressDir();
