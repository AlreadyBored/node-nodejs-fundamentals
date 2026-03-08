import fsPromises from 'fs/promises';
import path from 'path';

const rootPath = process.cwd();

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt

  const partsDirPath = path.join(rootPath, 'parts');
  const outputPath = path.join(rootPath, 'merged.txt');

  try {
    await fsPromises.access(partsDirPath);
  } catch {
    throw new Error('FS operation failed');
  }

  const args = process.argv;
  const filesArgIndex = args.indexOf('--files');

  const filesToMergeArr = [];
  const fileNamesStr = args[filesArgIndex + 1];
  // console.log(args,filesArgIndex,fileNames);

  if (filesArgIndex !== -1 && !!fileNamesStr) {
    filesToMergeArr.push(...fileNamesStr.split(','));

    for (let i = 0; i < filesToMergeArr.length; i += 1) {
      const file = filesToMergeArr[i];
      // console.log(file);

      try {
        await fsPromises.access(path.join(partsDirPath, file));
      } catch {
        throw new Error('FS operation failed');
      }
    }
  } else {
    const files = await fsPromises.readdir(partsDirPath);
    filesToMergeArr.push(...files.filter((item) => item.endsWith('.txt')));
  }

  if (filesToMergeArr.length === 0) {
    throw new Error('FS operation failed');
  }

  let result = '';

  // console.log(filesToMergeArr);

  for (let i = 0; i < filesToMergeArr.length; i += 1) {
    const file = filesToMergeArr[i];

    // console.log(file);

    const fileContent = await fsPromises.readFile(
      path.join(partsDirPath, file),
      'utf8'
    );

    result += fileContent;

    // console.log(fileContent, result);
  }

  await fsPromises.writeFile(outputPath, result);
};

await merge();
