import fs from 'fs/promises';
import path from 'path';

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt
  const workspacePath = path.join(process.cwd());
  const partsPath = path.join(workspacePath, 'parts');
  const outputPath = path.join(workspacePath, 'merged.txt');
  const args = process.argv.slice(2);

  let filesToMerge = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--files' && args[i + 1]) {
      filesToMerge = args[i + 1]
        .split(',')
        .map((file) => file.trim())
        .filter(Boolean);
    }
  }

  try {
    await fs.access(partsPath);

    let fileNames;

    if (filesToMerge) {
      fileNames = filesToMerge;

      for (const fileName of fileNames) {
        const filePath = path.join(partsPath, fileName);
        await fs.access(filePath);
      }
    } else {
      const items = await fs.readdir(partsPath, { withFileTypes: true });

      fileNames = items
        .filter((item) => item.isFile() && path.extname(item.name) === '.txt')
        .map((item) => item.name)
        .sort();

      if (fileNames.length === 0) {
        throw new Error('FS operation failed');
      }
    }

    let mergedContent = '';

    for (const fileName of fileNames) {
      const filePath = path.join(partsPath, fileName);
      const content = await fs.readFile(filePath, 'utf-8');
      mergedContent += content;
    }

    await fs.writeFile(outputPath, mergedContent, 'utf-8');
  } catch {
    throw new Error('FS operation failed');
  }
};

await merge();
