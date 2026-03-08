import { createReadStream, createWriteStream } from 'node:fs';
import { access, constants, mkdir, unlink, readFile, writeFile } from 'node:fs/promises';
import { createBrotliDecompress } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { sep } from 'path';

const decompressDir = async () => {
  // Write your code here
  // Read archive.br from workspace/compressed/
  // Decompress and extract to workspace/decompressed/
  // Use Streams API

  // uncompress br,
  // restore structrues
  const archiveFile = `workspace${sep}compressed${sep}archive.br`
  const snapshotDestination = `workspace${sep}decompressed_snapshot.json`
  return access(archiveFile, constants.F_OK)
  // .catch(e => {
  //   //console.log(e)
  //   throw new Error('FS operation failed');
  // })
  .then(f => {
    return deCompress(archiveFile, snapshotDestination)
  }).then(p => {
    return readFile(snapshotDestination, { encoding: 'utf8' })
  }).then(snapshotContent => {
    return restore(snapshotContent)
  })
  .finally(() => unlink(snapshotDestination))
  .catch(e => {
    throw new Error('FS operation failed');
  })
};

async function restore(snapshot) {
  let entries
  try {
    entries = JSON.parse(snapshot)
  } catch (err) {
    console.log('Json content expected, please recreate archive')
    process.exit(1)
  }

  if (entries == undefined || entries.length == 0) {
    return Promise.resolve('Ok')
  }

  const basePath = 'workspace' + sep + 'decompressed'

  return mkdir(basePath, { recursive: true })
    .then(() => {
      const promises = entries
        .filter(f => f.type == 'd')
        .map(d => mkdir(basePath + sep + d.path, { recursive: true }))
      return Promise.all(promises); // restore all folders
    }).then(() => {
      const filePromises = entries
        .filter(f => f.type == 'f')
        .map(f => writeFile(basePath + sep + f.path, atob(f.content), 'utf8'))
      return Promise.all(filePromises); // restore all files
    })
}

async function deCompress(archiveFile, snapshotDestination) {
  const source = createReadStream(archiveFile);
  const destination = createWriteStream(snapshotDestination);
  const decompressor = createBrotliDecompress();
  return await pipeline(source, decompressor, destination);
}

await decompressDir();
