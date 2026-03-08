import { createReadStream, createWriteStream } from 'node:fs';
import { access, constants, mkdir, unlink, readdir, readFile } from 'node:fs/promises';
import { createBrotliCompress } from 'node:zlib';
import { pipeline } from 'node:stream';
import { sep } from 'path';

const compressDir = async () => {
  // Write your code here
  // Read all files from workspace/toCompress/
  // Compress entire directory structure into archive.br
  // Save to workspace/compressed/
  // Use Streams API
  const folderName = 'workspace' + sep + 'toCompress'

  return access(folderName, constants.F_OK).then(d => {
    return folderSnapshot(folderName)
  }).then(() => {
    return compressBr(`${folderName}_snapshot.json`)
  }).catch(e => {
    console.log(e)
    throw new Error('FS operation failed');
  })
};

async function folderSnapshot(folderName) {
  var fileContents = []
  let files
  try {
    files = await readdir(folderName, { withFileTypes: true, recursive: true });
  } catch (error) {
    console.log('FS operation failed', error)
    process.exit(1)
  }

  var promises = []
  for (const file of files) {
    let relativePath = file.parentPath + sep + file.name
    const relativeFilePath = relativePath.replace(folderName + sep, '')
    if (file.isDirectory()) {
      fileContents.push({ path: relativeFilePath, type: 'd' })
    } else {
      const promise = readFile(relativePath)
        .then(data => {
          fileContents.push({ path: relativeFilePath, type: 'f', content: Buffer.from(data).toString('base64') })
        })
      promises.push(promise)
    }
  }
  await Promise.all(promises)

  let shapshotContent = JSON.stringify(fileContents)
  const output = createWriteStream(`${folderName}_snapshot.json`);
  output.write(shapshotContent);
  
  return new Promise((resolve, reject) => {
    output.on('finish', () => resolve('Ok'));
    output.on('error', reject);
    output.end();
  });
}

async function compressBr(tmpFile) {
  const source = createReadStream(tmpFile);
  return mkdir('workspace' + sep + 'compressed', { recursive: true })
    .then(f => {
      const destination = createWriteStream('workspace' + sep + 'compressed/archive.br');
      const compressor = createBrotliCompress();
      pipeline(source, compressor, destination, (err) => {
        if (err) {
          console.log(err)
          throw new Error('Something wrong happend while compressing')
        }
      });
      return Promise.resolve('Ok')
    }).finally(err => {
      return unlink(tmpFile) // delete snapshot
    });
}



await compressDir();
