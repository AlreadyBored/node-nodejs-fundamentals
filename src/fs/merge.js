import { readdir, readFile, writeFile } from 'node:fs/promises';
const merge = async () => {
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt
  const partsDir = `${process.cwd()}/workspace/parts`;
  const mergedFilePath = `${process.cwd()}/workspace/merged.txt`;
  let filesContent = Buffer.alloc(0);
  const extArgIndex = process.argv.indexOf('--files');
  if (extArgIndex !== -1 && process.argv[extArgIndex + 1]) {
    const requestedFiles = process.argv[extArgIndex + 1].split(',').map(f => f.trim());
    for (const file of requestedFiles) {
      const filePath = `${partsDir}/${file}`;
      try {
        const fileContent = await readFile(filePath);
        filesContent = Buffer.concat([filesContent, fileContent]);
      } catch {
        console.error(`Requested file ${file} does not exist in parts directory.`);
        throw new Error("FS operation failed");
      }
    }
  } else {
    try {
      const entries = await readdir(partsDir, { withFileTypes: true });
      const txtFiles = entries.filter(e => e.isFile() && e.name.endsWith('.txt')).map(e => e.name).sort();
      if (txtFiles.length === 0) {
        throw new Error("No .txt files found in parts directory.");
      }
      for (const fileName of txtFiles) {
        const fileContent = await readFile(`${partsDir}/${fileName}`);
        filesContent = Buffer.concat([filesContent, fileContent]);
      }
    } catch (err) {
      console.error("Error reading parts directory:", err);
      throw new Error("FS operation failed");
    }
  }
  try {
    await writeFile(mergedFilePath, filesContent);
  } catch (err) {
    console.error("Error writing merged file:", err);
    throw new Error("FS operation failed");
  }
};

await merge();
