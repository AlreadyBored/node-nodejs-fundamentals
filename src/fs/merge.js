import fs from 'fs/promises'
import path from 'path'

const parseTextFiles = (files, filesToRead) => {
  const textFiles = files.filter(
    (file) => file.isFile() && path.extname(file.name) === '.txt',
  );

  if (filesToRead.length > 0) {  
    const byName = new Map(
      textFiles.map((f) => [f.name, f]),
    );

    return filesToRead.map((name) => byName.get(name));
  }

  return textFiles.sort((a, b) => a.name.localeCompare(b.name));
};

const parseArgs = () => {
  const indexOfFiles = process.argv.indexOf('--files');
  const filesString = process.argv[indexOfFiles + 1];

  if (indexOfFiles !== -1 && filesString) {
      return filesString.split(',');
  }

  return [];
}

const merge = async () => {
  const filesToRead = parseArgs();

  const workspacePath = path.join(process.cwd(), 'workspace');
  const partsPath = path.join(workspacePath, 'parts');

  try {
    const files = await fs.readdir(partsPath, { withFileTypes: true });
    const textFiles = parseTextFiles(files, filesToRead);

    if (textFiles.length === 0 || textFiles.some((f) => !f)) {
      throw new Error('FS operation failed');
    }

    const contents = await Promise.all(
      textFiles.map((file) => fs.readFile(path.join(partsPath, file.name), 'utf-8'))
    );

    await fs.writeFile(path.join(workspacePath, 'merged.txt'), contents.join(''));
  } catch {
    throw new Error('FS operation failed');
  }
};

await merge();
