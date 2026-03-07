import { createReadStream, createWriteStream } from 'fs'
import { join } from 'path';
import { createInterface } from 'readline/promises';

const getParamValue = (name) => {
  const args = process.argv;
  const index = args.indexOf(name);

  if (index === -1) {
    return null;
  }

  const value = args[index + 1];
  return value !== undefined ? value : null;
};

const split = async () => {
  const linesAmount = Number(getParamValue('--lines')) || 10;
  const lines = [];
  let filesCounter = 1;

  const writeLines = (lines) => {
    const writeStream = createWriteStream(join(process.cwd(), `chunk-${filesCounter++}.txt`));
    writeStream.write(lines.join('\n'));
    writeStream.end();
  }

  const input = createReadStream(join(process.cwd(), 'source.txt'))
  const rl = createInterface({ input });

  for await (const line of rl) {
    lines.push(line);
    
    if (lines.length === linesAmount) {

      writeLines([...lines]);
      lines.length = 0;
    }
  }

  if (lines.length > 0) {
    writeLines([...lines]);
  }
};

await split();
