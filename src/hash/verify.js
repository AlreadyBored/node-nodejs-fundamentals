import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const getEntries = (checksums) => {
  if (!checksums || typeof checksums !== 'object' || Array.isArray(checksums)) {
    return [];
  }

  return Object.entries(checksums).filter(
    ([filename, hash]) => typeof filename === 'string' && typeof hash === 'string'
  );
};

const calculateSha256 = (filePath) =>
  new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    //console.log(`Calculating SHA256 for file: ${filePath}`);
    const stream = createReadStream(filePath);
    //console.log(`Stream created for file: ${filePath}`);
    stream.on('data', (chunk) => {
      hash.update(chunk);
      //console.log(`Hash updated with chunk of size: ${chunk.length} bytes for file: ${filePath}`);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
     //console.log(`Finished calculating SHA256 for file: ${filePath}`); 
    });

    stream.on('error', (error) => {
      console.log(`Error occurred while calculating SHA256 for file: ${filePath}`, error);
      reject(error);
    });
  });

const verify = async () => {
  // Write your code here
  // Read checksums.json
  // Calculate SHA256 hash using Streams API
  // Print result: filename — OK/FAIL

  const checksumsPath = new URL('./checksums.json', import.meta.url);
  const checksumsFilePath = fileURLToPath(checksumsPath);
  let checksumsRaw;

  try {
    checksumsRaw = await readFile(checksumsPath, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      throw new Error('FS operation failed');
    }
    throw error;
  }

  const checksums = JSON.parse(checksumsRaw);
  //console.log(`checksums\n${JSON.stringify(checksums, null, 2)}`);
  const entries = getEntries(checksums);
  //console.log(`entries\n${JSON.stringify(entries, null, 2)}`);
  for (const [filename, expectedHash] of entries) {
    let status = 'FAIL';

    try {
      const actualHash = await calculateSha256(filename);
      //console.log(`actualHash\n${actualHash} expectedHash\n${expectedHash} filename\n${filename}`);
      status = actualHash.toLowerCase() === expectedHash.toLowerCase() ? 'OK' : 'FAIL';
    } catch {
      status = 'FAIL';
    }

    //console.log(`${filename} — ${status}`);
  }
};

await verify();
