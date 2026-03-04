import { parseArgs } from 'node:util';
import path from 'path';
import fs from 'fs';
const extFromCLI = process.argv.slice(2);
const { values } = parseArgs({
  extFromCLI,
  options: {
    ext: {
      type: 'string',
      default: 'text'
    }
  }
});
let deepestPath = '';


const findByExt = async (paths, fileArr) => {
  const dir = paths ? paths : '.';
  isWorksapceExisted(dir);
  const fileList = fileArr ? fileArr : [];

  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    if (!files && !files.length) {
      throw new Error('Not found!')
    }

    for (const file of files) {
      const fullPath = file.parentPath + '/' + file.name;

      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        await findByExt(fullPath, fileList);
      } else if (stat.isFile()
        && path.basename(fullPath).split('.')[path.basename(fullPath).split('.').length - 1] === values.ext) {
          fileList.push(fullPath);
          deepestPath = deepestPath.split('/').length > fullPath.split('/') ? deepestPath : fullPath;
      }
    }
  } catch (error) {
    console.error('Error: ', error);
  }

  return fileList;
};

const listArr = await findByExt();

for (const path of listArr) {
  const paths = relativePaths(path);
  paths.forEach((el) => {
    console.log(`\n${el}`)
  })
}

async function isWorksapceExisted(path) {
  const errorMsg = 'Worspace does not exist!';
  try {
    fs.accessSync(path);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Error: ', errorMsg);
    }
    console.error('Error: ', error); 
  }
}

function relativePaths(path) {
  const deepestPathSet = new Set();
  let pathStepByStep = '';
  for (let i = 0; i < path.split('/').length - 1; i++) {
    pathStepByStep = pathStepByStep + deepestPath.split('/')[i] + '/';
    deepestPathSet.add(pathStepByStep)
  }
  return deepestPathSet;
}