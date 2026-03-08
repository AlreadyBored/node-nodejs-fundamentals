import fs from 'fs';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { parseArgs } from 'node:util';

const transformDataToChunks = async (lineNumber = 10) => {
  let lineCount = 0;
  let fileNum = 1;
  let writeStream = fs.createWriteStream(`chunk_${fileNum}.txt`);

  const splitTransform = new Transform({
    transform(chunk, enc, cb) {
      let startIdx = 0;

      for (let i = 0; i < chunk.length; i++) {
        if (chunk[i] === 10) {
          lineCount++;

          if (lineCount === lineNumber) {
            writeStream.write(chunk.slice(startIdx, i + 1));
            writeStream.end();

            fileNum++;
            writeStream = fs.createWriteStream(`chunk_${fileNum}.txt`);
            lineCount = 0;
            startIdx = i + 1;
          }
        }
      }
      if (startIdx < chunk.length) {
        writeStream.write(chunk.slice(startIdx));
      }

      cb();
    },
    flush(cb) {
      writeStream.end(cb);
    },
  });

  await pipeline(fs.createReadStream('source.txt'), splitTransform);
};

const split = async () => {
  // Write your code here
  // Read source.txt using Readable Stream
  // Split into chunk_1.txt, chunk_2.txt, etc.
  // Each chunk max N lines (--lines CLI argument, default: 10)

  const options = {
    lines: {
      type: 'string',
    },
  };

  const { values } = parseArgs({ options });

  transformDataToChunks(Number(values.lines) || undefined);
};

await split();
