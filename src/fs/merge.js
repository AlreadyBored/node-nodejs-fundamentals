import fs from 'fs/promises';
import path from 'path';

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt
  
  const rootPath = '/home/dimazdr/projects/node-nodejs-fundamentals/parts';
  const mergedFilePath  = '/home/dimazdr/projects/node-nodejs-fundamentals/src/fs/merged.txt';
  const args = process.argv.slice(2);
  let files = null;
  const filesIndex = args.indexOf('--files');

  if (filesIndex !== -1 && args[filesIndex + 1]) {
    files = args[filesIndex + 1].split(',');
  } 
  
  let txtFiles = [];
  
  if (files) {
    txtFiles = files;
    } else {
      const items = await fs.readdir(rootPath, {withFileTypes: true});
      for (const item of items) {
        if (item.isFile() && path.extname(item.name) === '.txt') {
          txtFiles.push(item.name);
        }
    }
    txtFiles.sort();
    }
  
  let mergedContent = ''

  for (const file of txtFiles) {
    const filePath = path.join(rootPath, file);
    const content = await fs.readFile(filePath, 'utf8')
    mergedContent += content;
  }
  
  await fs.writeFile(mergedFilePath, mergedContent);
};

await merge();
