import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { argv } from 'node:process';

const parseLines = () => {
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lines' && args[i + 1]) {
      return parseInt(args[i + 1]) || 10;
    }
  }
  return 10;
};

const split = async () => {
  if (!existsSync('source.txt')) {
    console.error('source.txt not found!');
    process.exit(1);
  }

  const maxLines = parseLines();
  let currentChunk = 1;
  let lineCount = 0;
  let outputStream = null;
  let buffer = '';

  const sourceStream = createReadStream('source.txt', { encoding: 'utf8' });
  
  for await (const chunk of sourceStream) {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (lineCount >= maxLines) {
        if (outputStream) outputStream.end();
        currentChunk++;
        lineCount = 0;
      }
      
      outputStream = createWriteStream(`chunk_${currentChunk}.txt`, { flags: 'a' });
      
      if (line.trim()) {
        outputStream.write(line + '\n');
        lineCount++;
      }
    }
  }
  
  if (outputStream) outputStream.end();
  if (buffer.trim()) {
    outputStream = createWriteStream(`chunk_${currentChunk}.txt`, { flags: 'a' });
    outputStream.write(buffer + '\n');
    outputStream.end();
  }
  
  console.log(`Split into ${currentChunk} chunks`);
};

await split();
