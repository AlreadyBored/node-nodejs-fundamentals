import { createBrotliCompress } from "node:zlib";
import { createWriteStream } from "node:fs";
import { readdir, stat, readFile, mkdir } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { resolve, join, relative } from "node:path";
import { Readable } from "node:stream";

// Write your code here
// Read all files from workspace/toCompress/
// Compress entire directory structure into archive.br
// Save to workspace/compressed/
// Use Streams API

const compressDir = async () => {
  const sourceDir = resolve(process.cwd(), "workspace", "toCompress");
  const outputFolder = resolve(process.cwd(), "workspace", "compressed");
  const outputFile = join(outputFolder, "archive.br");

  try {
    // 1. Validation: Ensure source exists
    try {
      await stat(sourceDir);
    } catch {
      throw new Error("FS operation failed");
    }

    // 2. Prepare output directory
    await mkdir(outputFolder, { recursive: true });

    // 3. Helper to scan all files
    const entries = [];
    const scan = async (currentDir) => {
      const items = await readdir(currentDir);
      for (const item of items) {
        const fullPath = join(currentDir, item);
        const itemStat = await stat(fullPath);
        const relPath = relative(sourceDir, fullPath);

        if (itemStat.isFile()) {
          const content = await readFile(fullPath);
          entries.push({
            path: relPath,
            type: "file",
            content: content.toString("base64"),
          });
        } else if (itemStat.isDirectory()) {
          entries.push({ path: relPath, type: "directory" });
          await scan(fullPath);
        }
      }
    };

    await scan(sourceDir);

    // 4. Transform the structure into a Stream
    const dataString = JSON.stringify({ entries });
    const sourceStream = Readable.from([dataString]);

    // 5. The Compression Pipeline
    const compressor = createBrotliCompress();
    const destination = createWriteStream(outputFile);

    // [Image of a data pipeline connecting a source file to a processing unit]
    await pipeline(sourceStream, compressor, destination);

    process.stdout.write(
      "Directory compressed successfully into archive.br! \n"
    );
  } catch (error) {
    process.stderr.write("FS operation failed\n");
    process.exit(1);
  }
};

await compressDir();
