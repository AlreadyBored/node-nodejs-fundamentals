import { Transform } from 'stream';
import { createReadStream, createWriteStream, writeFileSync, existsSync } from 'node:fs';


const split = async () => {
  // Write your code here
  // Read source.txt using Readable Stream
  // Split into chunk_1.txt, chunk_2.txt, etc.
  // Each chunk max N lines (--lines CLI argument, default: 10)
  const maxLines = parseLinesArg();

  if (!existsSync("source.txt")) {
    console.error(`Error: source.txt not found`);
    process.exit(1);
  }

  const readable = createReadStream("source.txt", { encoding: 'utf-8' });
  const splitter = new LineSplitter(maxLines);

  readable
    .pipe(splitter);

  readable.on('error', (err) => {
    console.error(`Read error: ${err.message}`);
    process.exit(1);
  });
};



function parseLinesArg() {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--lines');

  if (idx !== -1 && args[idx + 1] !== undefined) {
    const parsed = parseInt(args[idx + 1], 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      console.error('Error: --lines must be a positive integer');
      process.exit(1);
    }
    return parsed;
  }

  return 10;
}

class LineSplitter extends Transform {
  constructor(maxLines) {
    super();
    this.maxLines = maxLines;
    this.lineBuffer = [];    // accumulates complete lines
    this.remainder = '';     // incomplete trailing text from previous chunk
    this.chunkIndex = 1;     // current output file number
  }

  _transform(chunk, encoding, callback) {
    const data = this.remainder + chunk.toString();
    const lines = data.split('\n');

    // Last element is either '' (if data ended with \n) or an
    // incomplete line — save it for the next _transform call.
    this.remainder = lines.pop();

    for (const line of lines) {
      this.lineBuffer.push(line);

      if (this.lineBuffer.length === this.maxLines) {
        this._writeChunk();
      }
    }

    callback();
  }


  _flush(callback) {
    if (this.remainder.length > 0) {
      this.lineBuffer.push(this.remainder);
      this.remainder = '';
    }

    if (this.lineBuffer.length > 0) {
      this._writeChunk();
    }

    callback();
  }

  _writeChunk() {
    const fileName = `chunk_${this.chunkIndex}.txt`;
    const content = this.lineBuffer.join('\n') + '\n';

    writeFileSync(fileName, content);
    console.log(`${fileName} (${this.lineBuffer.length} lines)`);

    this.lineBuffer = [];
    this.chunkIndex++;
  }
}

await split();
