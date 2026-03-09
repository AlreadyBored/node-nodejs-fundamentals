import fs from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { isFileOrDirectoryExist } from '../utils/util.js';

const verify = async () => {
  const dir = process.cwd();
  const pathToFile = `${dir}/checksums.json`;
  isFileOrDirectoryExist(pathToFile);
  let content;

  const data = await fs.readFile('./checksums.json', 'utf8');
  content = JSON.parse(data);

  for (const [name, expectedHash] of Object.entries(content)) {
    try {
      await fs.access(`${dir}/${name}`);
    } catch (error) {
      console.error(error)
    }

    try {
      const createdHash = createHash('sha256');

      const readStream = createReadStream(`${dir}/${name}`);

      await pipeline(readStream, createdHash);
      const hashed = createdHash.digest('hex');

      const isOK = hashed === expectedHash;
      console.log(`${name} - ${isOK}`);
    } catch (error) {
      console.error(error)
    }
  }
};

try {
  await verify();
} catch (error) {
  console.error(error)
}
