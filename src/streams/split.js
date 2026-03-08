import { createReadStream, createWriteStream } from 'node:fs';
import { Transform } from 'node:stream';

const split = () => {
  const args = process.argv;
  const linesIndex = args.indexOf('--lines');
  const maxLines = linesIndex !== -1 ? Number(args[linesIndex + 1]) : 10;
 
  let remainder = '';
  let lineCount = 0;
  let fileIndex = 1;
  let ws = null;
  

  const t = new Transform({
  transform(chunk, enc, cb) {
    const text = remainder + chunk.toString();
    const lines = text.split('\n');

    remainder = lines.pop();

  for (const line of lines) {
    if (!ws) {
      ws = createWriteStream(`chunk_${fileIndex}.txt`);
    }

    ws.write(line + '\n');
    lineCount++;

    if (lineCount === maxLines) {
      ws.end();
      fileIndex++;
      ws = null;
      lineCount = 0;
    }
  }

    cb();
  },

  _flush(cb) {
    if (remainder) {
      if (!ws) {
        ws = createWriteStream(`chunk_${fileIndex}.txt`)
      }

      ws.write(remainder + '\n');
      lineCount++;

      if (lineCount === maxLines) {
        ws.end();
        fileIndex++;
        ws = null;
        lineCount = 0;
      }
    }

    if (ws) {
      ws.end();
    }

    cb();
  }
  });
  const rs = createReadStream('source.txt');

  rs.pipe(t);
};

split();
