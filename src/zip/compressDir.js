import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { pipeline, PassThrough } from "stream";
import zlib from "zlib";

const workspace = path.join(process.cwd(), "workspace");
const inputDir = path.join(workspace, "toCompress");
const outputDir = path.join(workspace, "compressed");
const outputFile = path.join(outputDir, "archive.br");

async function getFiles(dir) {
  const entries = await fsPromises.readdir(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await getFiles(fullPath);
      files = files.concat(subFiles);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

const compressDir = async () => {
  try {
    await fsPromises.access(inputDir);
  } catch {
    throw new Error("FS operation failed");
  }

  await fsPromises.mkdir(outputDir, { recursive: true });
  const files = await getFiles(inputDir);
  const brotli = zlib.createBrotliCompress();
  const output = fs.createWriteStream(outputFile);

  pipeline(
    (async function* () {
      for (const filePath of files) {
        const relativePath = path.relative(inputDir, filePath);
        const stat = await fsPromises.stat(filePath);
        yield `${relativePath}\n`.toString("utf-8");
        yield `${stat.size}\n`.toString("utf-8");
        const fileStream = fs.createReadStream(filePath);
        for await (const chunk of fileStream) {
          yield chunk;
        }
      }
    })(),
    brotli,
    output,
    (err) => {
      if (err) console.error("Compression failed:", err);
      else console.log(`Compression done! archive.br created in ${outputDir}`);
    },
  );
};

await compressDir();
