import { createReadStream, createWriteStream, promises as fs } from 'fs';
import { resolve, join, dirname } from 'path';
import { createBrotliDecompress } from 'zlib';
import { pipeline } from 'stream/promises';
import { Writable } from 'stream';

const decompressDir = async () => {
  const archivePath = resolve(process.cwd(), 'workspace', 'compressed', 'archive.br');
  const decompressedDirPath = resolve(process.cwd(), 'workspace', 'decompressed');

  try {
    await fs.access(archivePath);
  } catch (error) {
    throw new Error('FS operation failed');
  }

  await fs.mkdir(decompressedDirPath, { recursive: true });

  const dearchiver = new Writable({
    write(chunk, encoding, callback) {
      this.buffer = this.buffer ? Buffer.concat([this.buffer, chunk]) : chunk;
      this.process().then(() => callback()).catch(callback);
    },
    final(callback) {
      callback();
    }
  });

  dearchiver.buffer = null;
  dearchiver.state = 'HEADER_START'; // HEADER_START, PATH, SIZE, DATA
  dearchiver.pathLength = 0;
  dearchiver.fileSize = 0n;
  dearchiver.currentPath = '';
  dearchiver.remainingData = 0n;
  dearchiver.writeStream = null;

  dearchiver.process = async function() {
    while (this.buffer && this.buffer.length > 0) {
      if (this.state === 'HEADER_START') {
        if (this.buffer.length < 2) return;
        this.pathLength = this.buffer.readUInt16BE(0);
        this.buffer = this.buffer.subarray(2);
        this.state = 'PATH';
      }

      if (this.state === 'PATH') {
        if (this.buffer.length < this.pathLength) return;
        this.currentPath = this.buffer.toString('utf8', 0, this.pathLength);
        this.buffer = this.buffer.subarray(this.pathLength);
        this.state = 'SIZE';
      }

      if (this.state === 'SIZE') {
        if (this.buffer.length < 8) return;
        this.fileSize = this.buffer.readBigUInt64BE(0);
        this.buffer = this.buffer.subarray(8);
        this.remainingData = this.fileSize;
        
        const targetPath = join(decompressedDirPath, this.currentPath);
        await fs.mkdir(dirname(targetPath), { recursive: true });
        this.writeStream = createWriteStream(targetPath);
        this.state = 'DATA';
      }

      if (this.state === 'DATA') {
        const canWrite = BigInt(this.buffer.length) >= this.remainingData 
          ? Number(this.remainingData) 
          : this.buffer.length;
        
        const data = this.buffer.subarray(0, canWrite);
        this.writeStream.write(data);
        this.remainingData -= BigInt(canWrite);
        this.buffer = this.buffer.subarray(canWrite);

        if (this.remainingData === 0n) {
          this.writeStream.end();
          this.writeStream = null;
          this.state = 'HEADER_START';
        } else {
          return;
        }
      }
    }
  };

  const brotli = createBrotliDecompress();
  const input = createReadStream(archivePath);

  await pipeline(input, brotli, dearchiver);
};

decompressDir().catch((err) => {
  if (err.message === 'FS operation failed') {
    throw err;
  }
});
