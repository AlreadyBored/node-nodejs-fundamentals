import fs from 'fs/promises';
import { createReadStream } from 'fs';
import crypto from 'crypto';

const verify = async () => {
  // Write your code here
  // Read checksums.json
  // Calculate SHA256 hash using Streams API
  // Print result: filename — OK/FAIL
  
  const filePath = './src/hash/checksums.json';

  let data;

  try {
    data = await fs.readFile(filePath, 'utf-8');
  } catch {
    throw new Error('FS operation failed');
  }

  const checksums = JSON.parse(data);

  for (const [filename, expectedHash] of Object.entries(checksums)) {
    const stream = createReadStream(filename);
    const hash = crypto.createHash('sha256');

    for await (const chunk of stream) {
      hash.update(chunk);
    }

    const actualHash = hash.digest('hex');
    console.log(`${filename} — ${actualHash === expectedHash ? 'OK' : 'FAIL'}`);
  }
};

await verify();