import fs from 'fs';
// import fsPromises from 'fs/promises';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const verify = async () => {
  // Write your code here
  // Read checksums.json
  // Calculate SHA256 hash using Streams API
  // Print result: filename — OK/FAIL
  const checksumsPath = path.join(currentDir, 'checksums.json');
  
  // check if checksums.json exists
  if (!fs.existsSync(checksumsPath)) {
    throw new Error('FS operation failed');
  }
  
  // read and parse checksums.json
  const checksumsContent = fs.readFileSync(checksumsPath, 'utf8');
  const expectedHashes = JSON.parse(checksumsContent);

  // console.log(expectedHashes);
  
  const filenames = Object.keys(expectedHashes);
  
  for (let i = 0; i < filenames.length; i += 1) {
    const filename = filenames[i];
    const checksumsHash = expectedHashes[filename];
    const filePath = path.join(currentDir, filename);
    
    try {
      const fileContent = fs.readFileSync(filePath);
      // console.log('asd');
      
      const hash = crypto.createHash('sha256');

      hash.update(fileContent);

      const fileHash = hash.digest('hex');

      if (fileHash === checksumsHash) {
        console.log(filename + ' — OK');
      } else {
        console.log(filename + ' — FAIL');
      }
    } catch {
      console.log(filename + ' — FAIL');
    }
  }
};

await verify();
