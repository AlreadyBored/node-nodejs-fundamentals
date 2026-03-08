import fsPromises from 'fs/promises';
import path from 'path';

const rootPath = process.cwd();

const findByExt = async () => {
  // Write your code here
  // Recursively find all files with specific extension
  // Parse --ext CLI argument (default: .txt)

  try {
    await fsPromises.access(rootPath);
  } catch {
    throw new Error('FS operation failed');
  }

  let extension = '.txt';
  const args = process.argv;

  const extArg = args.indexOf('--ext');

  if (extArg !== -1) {
    extension = args[extArg + 1];

    if (extension[0] !== '.') {
      extension = '.' + extension;
    }
  }

  // console.log(extension);

  const files = [];

  await scanRecursively(rootPath, extension, files);

  files.sort();

  for (let i = 0; i < files.length; i += 1) {
    console.log(files[i]);
  }
};

const scanRecursively = async (pathToCheck, extension, files) => {
  const dirContents = await fsPromises.readdir(pathToCheck, { withFileTypes: true });

  for (let i = 0; i < dirContents.length; i += 1) {
    const item = dirContents[i];
    const fullPath = path.join(pathToCheck, item.name);

    if (item.isDirectory()) {
      await scanRecursively(fullPath, extension, files);
    } else if (item.name.endsWith(extension)) {
      const shortPath = path.relative(rootPath, fullPath);
      files.push(shortPath);
    }
  }
}

await findByExt();
