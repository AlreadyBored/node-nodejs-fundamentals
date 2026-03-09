import fs from "fs";
import path from "path";
import zlib from "zlib";
import { pipeline } from "stream/promises";

function createTarHeader(name, size, type = "0") {
  const buf = Buffer.alloc(512);
  buf.write(name);
  buf.write("0000777", 100);
  buf.write("0000000", 108);
  buf.write("0000000", 116);
  buf.write(size.toString(8).padStart(11, "0") + "\0", 124);
  buf.write(
    Math.floor(Date.now() / 1000)
      .toString(8)
      .padStart(11, "0") + "\0",
    136,
  );
  buf.fill(" ", 148, 156);
  buf.write(type, 156);
  buf.write("ustar", 257);
  buf.write("00", 263);

  let sum = 0;
  for (let i = 0; i < 512; i++) sum += buf[i];
  buf.write(sum.toString(8).padStart(6, "0") + "\0 ", 148);

  return buf;
}

async function* walk(dir, base = dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full);

    if (entry.isDirectory()) {
      yield { path: rel + "/", size: 0, type: "5", full };
      yield* walk(full, base);
    } else if (entry.isFile()) {
      const stat = await fs.promises.stat(full);
      yield { path: rel, size: stat.size, type: "0", full };
    }
  }
}

const compressDir = async () => {
  const sourceDir = path.join(process.cwd(), "toCompress");
  const outputDir = path.join(process.cwd(), "compressed");
  const outputFile = path.join(outputDir, "archive.br");

  if (!fs.existsSync(sourceDir)) {
    throw new Error("FS operation failed");
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const brotli = zlib.createBrotliCompress({
    params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 6 },
  });

  const outStream = fs.createWriteStream(outputFile);
  brotli.pipe(outStream);

  for await (const file of walk(sourceDir)) {
    brotli.write(createTarHeader(file.path, file.size, file.type));

    if (file.type === "0") {
      await pipeline(
        fs.createReadStream(file.full),
        async function* (source) {
          for await (const chunk of source) yield chunk;
        },
        brotli,
        { end: false },
      );

      const remainder = file.size % 512;
      if (remainder) {
        brotli.write(Buffer.alloc(512 - remainder));
      }
    }
  }

  brotli.write(Buffer.alloc(1024));
  brotli.end();

  return new Promise((resolve, reject) => {
    outStream.on("finish", () => resolve());
    outStream.on("error", reject);
  });
};

await compressDir();
