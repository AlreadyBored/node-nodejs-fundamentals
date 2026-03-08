import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream';
import zlib from 'zlib';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pipe = promisify(pipeline);

const compressDir = async () => {
  const baseDir = path.join(__dirname, '../../');
  const srcDir = path.join(baseDir, 'workspace/toCompress');
  const destDir = path.join(baseDir, 'workspace/compressed');
  const archivePath = path.join(destDir, 'archive.br');

  try {
    await fsp.access(srcDir);
  } catch {
    throw new Error('FS operation failed');
  }

  try {
    await fsp.mkdir(destDir, { recursive: true });
  } catch {
    throw new Error('FS operation failed');
  }

  async function collectEntries(dir, rel = '') {
    const entries = [];
    const dirents = await fsp.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const fullPath = path.join(dir, dirent.name);
      const relPath = path.join(rel, dirent.name);
      if (dirent.isDirectory()) {
        entries.push({ type: 'directory', path: relPath });
        entries.push(...await collectEntries(fullPath, relPath));
      } else if (dirent.isFile()) {
        entries.push({ type: 'file', path: relPath, fullPath });
      }
    }
    return entries;
  }

  let entries;
  try {
    entries = await collectEntries(srcDir);
  } catch {
    throw new Error('FS operation failed');
  }

  const archiveObj = [];
  for (const entry of entries) {
    if (entry.type === 'directory') {
      archiveObj.push({ type: 'directory', path: entry.path });
    } else if (entry.type === 'file') {
      const content = await fsp.readFile(entry.fullPath);
      archiveObj.push({
        type: 'file',
        path: entry.path,
        content: content.toString('base64')
      });
    }
  }

  const jsonStream = fs.createReadStream(
    await (async () => {
      const tmpPath = path.join(destDir, 'tmp-archive.json');
      await fsp.writeFile(tmpPath, JSON.stringify(archiveObj), 'utf8');
      return tmpPath;
    })()
  );
  const brotli = zlib.createBrotliCompress();
  const outStream = fs.createWriteStream(archivePath);

  try {
    await pipe(jsonStream, brotli, outStream);
  } catch {
    throw new Error('FS operation failed');
  }

  try {
    await fsp.unlink(path.join(destDir, 'tmp-archive.json'));
  } catch {
    // ignore
  }
};

await compressDir();