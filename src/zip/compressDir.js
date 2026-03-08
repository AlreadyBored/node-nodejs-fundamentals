import { mkdir, readdir, stat, access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { createWriteStream } from 'node:fs';
import { join } from 'node:path';

const compressDir = async () => {
  const sourceDir = 'src/workspace/toCompress';
  
  try {
    await access(sourceDir, constants.R_OK);
  } catch {
    throw new Error('FS operation failed');
  }

  await mkdir('src/workspace/compressed', { recursive: true });
  
  const files = await getAllFiles(sourceDir);
  console.log(`Compressing ${files.length} files`);
  
  const archivePath = 'src/workspace/compressed/archive.br';
  const writeStream = createWriteStream(archivePath);
  
  writeStream.write(`FILES:${files.length}|`);
  
  for (const [relPath, fullPath] of files) {
    const content = await readFile(fullPath, 'utf8');
    const header = `${relPath}|${content.length}|`;
    
    console.log(`Adding ${relPath} (${content.length} chars)`);
    writeStream.write(header);
    writeStream.write(content);
  }
  
  writeStream.end();
  
  await new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      console.log('✓ archive.br created');
      resolve();
    });
    writeStream.on('error', reject);
  });
};

const getAllFiles = async (dir, prefix = '') => {
  const files = [];
  const entries = await readdir(dir).catch(() => []);
  
  for (const entry of entries) {
    const path = join(dir, entry);
    const stats = await stat(path).catch(() => null);
    
    if (stats?.isDirectory()) {
      files.push(...await getAllFiles(path, `${prefix}${entry}/`));
    } else if (stats) {
      files.push([`${prefix}${entry}`, path]);
    }
  }
  
  return files;
};

(async () => {
  try {
    await compressDir();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
