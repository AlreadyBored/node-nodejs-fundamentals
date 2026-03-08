import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';


const verify = async () => {
  // Write your code here
  // Read checksums.json
  // Calculate SHA256 hash using Streams API
  // Print result: filename — OK/FAIL


  let content
  try {
    content = await readFile('checksum.js', { encoding: 'utf-8' }).then(c => JSON.parse(c))
  } catch (err) {
    console.log('FS operation failed')
    process.exit(1)
  }
  if (content != null && content != '{}') {
    const promises = Object.keys(content)
      .map(k => compareHashes(k, content[k]))

    await Promise.all(promises);
  }
};

function compareHashes(fileName, hash) {
  return getFileChecksum(fileName).then(actual => {
    let res = 'OK'
    if (actual != hash) {
      res = 'FAIL'
    }
    console.log(`${fileName} - ${res}`)
  })
}

function getFileChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}

await verify();
