import fs, { constants } from 'node:fs/promises';
const rootPath = process.cwd() + '/workspace';
  const readableFileContent = {
    rootPath: rootPath,
    entries: []
  };

const snapshot = async (paths) => {
  const dir = paths ? paths : rootPath;
  isWorksapceExisted(dir);

  try {
    const files = await fs.readdir(dir, { withFileTypes: true });

    for await (const file of files) {
      const fullPath = dir + '/' + file.name;

      if (file.isDirectory()) {
        await snapshot(fullPath);
        readableFileContent.entries.push({
          path: dir.split(process.cwd() + '/workspace')[1],
          type: 'directory',
        });
      } else {
        await fs.access(fullPath, constants.R_OK);
        const content = (await fs.readFile(fullPath)).toString('base64');
        const size = (await fs.stat(fullPath)).size;
        readableFileContent.entries.push({
          path: dir.split(process.cwd() + '/workspace')[1] + file.name,
          type: 'file',
          size: size,
          content: content
        });
      }

      fs.writeFile('./snapshot.json', JSON.stringify(readableFileContent, null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Error: ', err);
        } else {
          console.log('Successfully completed!');
        }
      })
    }
  } catch (error) {
    if (error === 'ENOENT') {
      console.error('Error: ', "No such file exist!");
    } else if (error === 'EACCES') {
      console.error('Error: ', "Access Denied!")
    } else {
      console.error('Error: ', error)
    }
  }
};

await snapshot();


async function isWorksapceExisted(path) {
  const errorMsg = 'FS operation failed';
  try {
    await fs.access(path, constants.R_OK);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Error: ', errorMsg);
    } else if (error.code === 'EACCES') {
      console.error('Error: ', 'Access Denied!');
    }
    console.error('Error: ', error); 
  }
}