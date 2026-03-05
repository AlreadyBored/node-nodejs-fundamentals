import { readdir } from 'node:fs/promises';
const findByExt = async () => {
  // Write your code here
  // Recursively find all files with specific extension
  // Parse --ext CLI argument (default: .txt)
  const filesWithExt = [];
  const extArgIndex = process.argv.indexOf('--ext');
  const ext = extArgIndex !== -1 && process.argv[extArgIndex + 1] ? process.argv[extArgIndex + 1] : 'txt';
  const rootPath = `${process.cwd()}/workspace`;
  try {
    await findFilesWithExt(rootPath, ext, filesWithExt);
    filesWithExt.sort();
    filesWithExt.forEach(file => console.log(file));
  } catch (err) {
    console.error("Error finding files with extension:", err);
    throw new Error("FS operation failed");
  }
};

/*
* Recursively find files with specific extension and store their relative paths in result array
*/
const findFilesWithExt = async (dir, ext, result) => {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      await findFilesWithExt(fullPath, ext, result);
    } else if (entry.isFile() && entry.name.endsWith(`.${ext}`)) {
      result.push(fullPath.replace(`${process.cwd()}/workspace`, ''));
    }
  }
};

await findByExt();
