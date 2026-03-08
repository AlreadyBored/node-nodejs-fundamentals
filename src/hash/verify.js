import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';

const verify = async () => {
  const checksumFile = path.join(process.cwd(), 'src', 'hash', 'checksums.json')

  try{
    const content = await readFile(checksumFile, 'utf-8')
    const checksums = JSON.parse(content);

    for (const [fileName, expectedHash] of Object.entries(checksums)){
      const hash = createHash('sha256')
      const source = createReadStream(path.join(process.cwd(), 'src', 'hash', 'toBeHashedFiles', fileName));
      try{
        await pipeline(source, hash)

        const actualHash = hash.digest('hex')
        const status = actualHash === expectedHash ? 'OK' : 'FAIL'

        console.log(`${fileName} - ${status}`)
      }catch (err){
        console.log(err)
        throw 'FS operation failed'
      }
    }
  }catch (err){
    console.log(err)
    throw 'FS operation failed'
  }
};

await verify();
