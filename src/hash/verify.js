import fs from 'fs';
import path from 'node:path';
import { createHash } from 'crypto';
import { pipeline } from 'stream/promises';

import { WORKSPACE_DIR, PARTS_DIR } from '../constants.js';

const generateChecksumFile = async (filesWithPath) => {
  const checksumFilePath = path.join(WORKSPACE_DIR, 'checksums.json');
  await fs.promises.rm(checksumFilePath, { force: true });
  const writeStream = fs.createWriteStream(checksumFilePath, { flags: 'a' });

  const digests = {};
  for (const file of filesWithPath) {
    const fileName = path.basename(file);
    const digest = await calculateHash(file);
    digests[fileName] = digest;
  }

  writeStream.write(JSON.stringify(digests));
};

const calculateHash = async (file) => {
  const hash = createHash('sha256');
  const stream = fs.createReadStream(file);

  await pipeline(stream, hash);

  return hash.digest('hex');
};

const verify = async () => {
  //Source folder with files to verify: workspace/parts
  const filesDir = path.join(WORKSPACE_DIR, PARTS_DIR);

  try {
    const files = await fs.promises.readdir(filesDir);

    const filesWithPath = files.map((file) => path.join(filesDir, file));
    //checksum.json file generation. After checksum.json was generated, you can comment out the line below, change some data
    // and run verify.js again to check files integrity based on checksum.json
    await generateChecksumFile(filesWithPath);

    const checksumsFilePath = path.join(WORKSPACE_DIR, 'checksums.json');
    const checksumsData = await fs.promises.readFile(
      checksumsFilePath,
      'utf-8',
    );
    const checksums = JSON.parse(checksumsData);

    for (const file of filesWithPath) {
      const fileName = path.basename(file);
      const digest = await calculateHash(file);
      const expectedDigest = checksums[fileName];
      if (digest === expectedDigest) {
        console.log(`${fileName} - OK`);
      } else {
        console.log(`${fileName} - FAIL`);
      }
    }
  } catch (err) {
    throw new Error(`FS operation failed: ${err.message}`);
  }
};
await verify();
