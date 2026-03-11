import { createReadStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const split = async () => {
  // Write your code here
  // Read source.txt using Readable Stream
  // Split into chunk_1.txt, chunk_2.txt, etc.
  // Each chunk max N lines (--lines CLI argument, default: 10)
  const linesArgIndex = process.argv.indexOf('--lines');
  const parsedLinesValue = linesArgIndex >= 0 ? Number.parseInt(process.argv[linesArgIndex + 1] ?? '', 10) : Number.NaN;
  const linesPerChunk = Number.isInteger(parsedLinesValue) && parsedLinesValue > 0 ? parsedLinesValue : 10;

  const sourceFilePath = path.resolve(process.cwd(), 'source.txt');
  const sourceStream = createReadStream(sourceFilePath, { encoding: 'utf8' });

  let buffer = '';
  let chunkIndex = 1;
  let currentChunkLineCount = 0;
  let currentChunkParts = [];

  const flushChunk = async () => {
    if (currentChunkParts.length === 0) {
      return;
    }

    const chunkPath = path.resolve(process.cwd(), `chunk_${chunkIndex}.txt`);
    await writeFile(chunkPath, currentChunkParts.join(''), 'utf8');

    chunkIndex += 1;
    currentChunkLineCount = 0;
    currentChunkParts = [];
  };

  const appendLine = async (line) => {
    currentChunkParts.push(line);
    currentChunkLineCount += 1;

    if (currentChunkLineCount >= linesPerChunk) {
      await flushChunk();
    }
  };

  for await (const chunk of sourceStream) {
    buffer += chunk;

    let newlineIndex = buffer.indexOf('\n');
    while (newlineIndex !== -1) {
      const lineWithSeparator = buffer.slice(0, newlineIndex + 1);
      buffer = buffer.slice(newlineIndex + 1);

      await appendLine(lineWithSeparator);
      newlineIndex = buffer.indexOf('\n');
    }
  }

  if (buffer.length > 0) {
    await appendLine(buffer);
  }

  await flushChunk();
};

await split();
