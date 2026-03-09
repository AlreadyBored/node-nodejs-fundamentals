import fs from 'fs';

const split = () =>
  new Promise((resolve, reject) => {
    const linesIndex = process.argv.indexOf('--lines');
    const maxLines = linesIndex !== -1 ? parseInt(process.argv[linesIndex + 1], 10) : 10;

    let buffer = '';
    let lineCount = 0;
    let chunkIndex = 0;
    let writer = null;

    const nextWriter = () => {
      chunkIndex++;
      lineCount = 0;
      writer = fs.createWriteStream(`chunk_${chunkIndex}.txt`);
      return writer;
    };

    const readable = fs.createReadStream('source.txt', { encoding: 'utf8' });

    readable.on('error', reject);

    readable.on('data', (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!writer) nextWriter();
        writer.write(`${line}\n`);
        lineCount++;
        if (lineCount >= maxLines) {
          writer.end();
          writer = null;
        }
      }
    });

    readable.on('end', () => {
      if (buffer.length > 0) {
        if (!writer) nextWriter();
        writer.write(`${buffer}\n`);
      }
      if (writer) {
        writer.end();
        writer.on('finish', resolve);
      } else {
        resolve();
      }
    });
  });

await split();
