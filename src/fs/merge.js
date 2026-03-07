import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const merge = async () => {
  const partsDir = join(fileURLToPath(import.meta.url), '..', 'workspace', 'parts');
  const outputPath = join(fileURLToPath(import.meta.url), '..', 'workspace', 'merged.txt');

  const args = process.argv;
  const filesIndex = args.indexOf('--files');

  let fileNames;
  if (filesIndex !== -1) {
    fileNames = args[filesIndex + 1].split(',');
  } else {
    const allFiles = await readdir(partsDir);
    fileNames = allFiles.filter((f) => f.endsWith('.txt')).sort();
  }

  const contents = [];
  for (const fileName of fileNames) {
    const content = await readFile(join(partsDir, fileName), 'utf-8');
    contents.push(content);
  }

  await writeFile(outputPath, contents.join(''), 'utf-8');
  console.log(`Merged ${fileNames.length} files into ${outputPath}`);
};

await merge();
