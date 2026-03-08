import { createReadStream, createWriteStream } from 'fs';
import { Transform, Writable } from 'stream';
import { createInterface } from 'readline';

const split = async () => {
  const args = process.argv.slice(2);
  const linesIndex = args.indexOf('--lines');
  const N = linesIndex !== -1 && args[linesIndex + 1] ? parseInt(args[linesIndex + 1], 10) : 10;

  let chunkIndex = 1;
  let lineBuffer = [];
  let currentWriter = null;

  const getWriter = () => createWriteStream(`chunk_${chunkIndex}.txt`);

  const flushBuffer = () => {
    return new Promise((resolve, reject) => {
      if (lineBuffer.length === 0) return resolve();
      const writer = getWriter();
      writer.write(lineBuffer.join('\n') + '\n', (err) => {
        if (err) return reject(err);
        writer.end(resolve);
      });
      chunkIndex++;
      lineBuffer = [];
    });
  };

  const rl = createInterface({
    input: createReadStream('source.txt'),
    crlfDelay: Infinity,
  });

  const processLines = async () => {
    for await (const line of rl) {
      lineBuffer.push(line);
      if (lineBuffer.length >= N) {
        await flushBuffer();
      }
    }
    await flushBuffer();
    console.log(`Done! Created ${chunkIndex - 1} chunk(s).`);
  };

  processLines().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
};

await split();
