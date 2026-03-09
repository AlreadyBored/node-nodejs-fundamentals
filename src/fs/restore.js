import fs, { constants } from 'node:fs/promises';

const restore = async () => {
  const dir = process.cwd();
  const jsonDir = dir + '/snapshot.json';
  isJSONEXist(jsonDir);

  try {
    await fs.mkdir(dir + '/workspace_restored');
  } catch (error) {
    if (error === 'ENOENT') {
      console.error(Error('FS operation failed'));
    }
  } 

  try {    
    const data = await fs.readFile('./snapshot.json', 'utf8');
    const content = JSON.parse(data);

    for (const entry of content.entries) {
      let pathFromJSON = content.rootPath;

      pathFromJSON =  pathFromJSON.split('/workspace')[0] +'/workspace_restored/' + entry.path;

      if (entry.type === 'directory') {
        await fs.mkdir(pathFromJSON);
      } else if (entry.type === 'file') {
        const base64String = entry.content;
        const buffer = Buffer.from(base64String, 'base64');
        await fs.writeFile(pathFromJSON, buffer);

      }
    }

  } catch (error) {
    if (error === 'ENOENT') {
      console.error(Error('FS operation failed'));
    } else if (error === 'EACCES') {
      console.error(Error("Access Denied!"));
    } else {
      console.error(Error(error))
    }
  }
};

await restore();


async function isJSONEXist(path) {
  const errorMsg = 'FS operation failed';
  try {
    await fs.access(path, constants.R_OK);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(Error(errorMsg));
    } else if (error.code === 'EACCES') {
      console.error(Error('Access Denied!'));
    }
    console.error(Error(error)); 
  }
}