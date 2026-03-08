import { mkdir, access, constants, readFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { join, dirname } from 'node:path';

const decompressDir = async () => {
  const archivePath = 'src/workspace/compressed/archive.br';
  
  try {
    await access('src/workspace/compressed', constants.R_OK);
    await access(archivePath, constants.R_OK);
  } catch {
    throw new Error('FS operation failed');
  }

  await mkdir('src/workspace/decompressed', { recursive: true });
  
  const buffer = await readFile(archivePath, 'utf8');
  
  const headerMatch = buffer.match(/^FILES:(\d+)\|(.*)$/s);
  if (!headerMatch) throw new Error('Invalid archive');
  
  const [, fileCount, remaining] = headerMatch;
  let pos = 0;
  
  for (let i = 0; i < parseInt(fileCount); i++) {
    const pathEnd = remaining.indexOf('|', pos);
    const relPath = remaining.slice(pos, pathEnd);
    
    const sizeStart = pathEnd + 1;
    const sizeEnd = remaining.indexOf('|', sizeStart);
    const size = parseInt(remaining.slice(sizeStart, sizeEnd));
    
    const dataStart = sizeEnd + 1;
    const fileData = remaining.slice(dataStart, dataStart + size);
    
    console.log(`${i+1}. ${relPath}: ${size} chars → "${fileData}"`);
    
    const destPath = join('src/workspace/decompressed', relPath);
    await mkdir(dirname(destPath), { recursive: true });
    
    const ws = createWriteStream(destPath);
    ws.end(fileData);
    await new Promise(r => ws.on('finish', r));
    
    pos = dataStart + size;
  }
  
  console.log('✓ All files extracted');
};

(async () => {
  try {
    await decompressDir();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
