import fs from 'fs/promises'
import path from 'path'

const parseExt = () => {
  const indexOfExt = process.argv.indexOf('--ext');
  const ext = process.argv[indexOfExt + 1];

  if (indexOfExt !== -1 && ext) {
    return ext;
  }

  return null;
}

const findByExt = async () => {
  const workspacePath = path.join(process.cwd(), 'workspace');
  const ext = `.${parseExt() ?? 'txt'}`

  try {
    const files = await fs.readdir(workspacePath, {recursive: true, withFileTypes: true})
    
    const filteredFiles = files.filter(file => {
      return file.isFile() && path.extname(file.name) === ext;
    })

    const relativePaths = filteredFiles.map((file) => path
      .relative(workspacePath, path.join(file.parentPath, file.name)))
      .sort((a, b) => {
        return a.localeCompare(b);
      });

    relativePaths.forEach((filePath) => {
      console.log(filePath);
    })
  } catch {
    throw new Error('FS operation failed');
  }
};

await findByExt();
