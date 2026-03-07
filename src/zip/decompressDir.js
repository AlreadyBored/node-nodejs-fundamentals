import { createReadStream, createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { cwd } from "node:process";
import { pipeline } from "node:stream/promises";
import { createBrotliDecompress } from "node:zlib";

const decompressDir = async () => {
  const workspaceDir = join(cwd(), "home/user/workspace");
  const archivePath = join(workspaceDir, "compressed", "archive.br");

  async function* streamGenerator(stream) {
    let buffer = Buffer.alloc(0);

    const extract = (n) => {
      const chunk = buffer.subarray(0, n);
      buffer = buffer.subarray(n);

      return chunk;
    };

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);

      while (buffer.length >= 4) {
        const pathLen = buffer.readUInt32BE(0);
        const headerSize = 4 + pathLen + 8;

        if (buffer.length < headerSize) break;

        extract(4);
        const fileRelativePath = extract(pathLen).toString();
        const fileSize = Number(extract(8).readBigUInt64BE(0));

        const fullPath = join(workspaceDir, "decompressed", fileRelativePath);
        await mkdir(dirname(fullPath), { recursive: true });

        const ws = createWriteStream(fullPath);

        let written = 0;
        while (written < fileSize) {
          if (buffer.length === 0) {
            const nextChunk = (await stream.next()).value;

            if (!nextChunk) break;
            buffer = nextChunk;
          }

          const canWrite = Math.min(buffer.length, fileSize - written);
          ws.write(extract(canWrite));
          written += canWrite;
        }
        ws.end();

        yield;
      }
    }
  }

  await pipeline(
    createReadStream(archivePath),
    createBrotliDecompress(),
    streamGenerator,
  ).catch(() => {throw new Error('FS operation failed')} );
};

await decompressDir();
