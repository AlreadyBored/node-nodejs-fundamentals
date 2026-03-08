import process from 'process';
import fs from 'fs';
import path from 'path';

const snapshot = async () => {
  const startDirectory = path.join(process.cwd(), 'workspace')
  if (!fs.existsSync(startDirectory) || !fs.statSync(startDirectory).isDirectory()){
    throw "FS operation failed"
  }

  var metadata = {
    "rootPath": startDirectory,
    "entries": []
  }

  const iterate = dir => {
    const directoryContent = fs.readdirSync(dir)

    for(let f of directoryContent){
      const entryPath = path.join(dir, directoryContent[f])
      const stats = fs.statSync(entryPath)
      let entry = {}
      
      entry.path = path.relative(startDirectory, entryPath)
      if (!stats.isDirectory()){
        entry.type = "file"
        entry.size = stats.size
        entry.content = fs.readFileSync(entryPath, 'base64')
      } else {
        entry.type = "directory"
        iterate(entryPath)
      }
      metadata.entries.push(entry)

    };
  };

  const saveSnapshot = () => {
    const parentDirectory = path.dirname(startDirectory)
    const snapshotData = JSON.stringify(metadata, null, 2)

    fs.writeFileSync(path.join(parentDirectory, "snapshot.json"), snapshotData)
  };

  iterate(startDirectory);
  saveSnapshot();
};

await snapshot();