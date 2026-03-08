import * as url from "url";
import path from "path";
import * as fs from "fs/promises";

const findByExt = async () => {
  const pathToThisFile = url.fileURLToPath(import.meta.url); // path to this file from url to this file

  const pathToThisDir = path.dirname(pathToThisFile); // path to the directory with this file

  const rootPath = path.resolve(pathToThisDir, "../../workspace"); // build path to the Workspace dir, 2 levels up

  try {
    await fs.stat(rootPath);
  } catch (error) {
    throw new Error("FS operation failed");
  } // if we can not get stat about the Workspace means it doesn't exist, we throw an error

  //let entries = [];
  let entries2 = []; //an array for the list of files
  let initRelPath = ""; // initial relative path to start scanning equals to nothing to start scan from Workspace dir itself

  let requiredExt = ".txt";

  let extArgIndex = process.argv.findIndex((cliArg) => cliArg === "--ext");
  if (extArgIndex > 1) {
    if (process.argv[extArgIndex + 1]) {
      requiredExt = "." + process.argv[extArgIndex + 1];
    }
  }

  async function dirContent(dirToCheck, accRelPath) {
    //dir to scan with absolute and relative paths
    let entries = await fs.readdir(dirToCheck, { withFileTypes: true }); //get a list of content of the dir
    for (let i = 0; i < entries.length; i++) {
      //check each element in the dir content list
      let fullPath = path.join(dirToCheck, entries[i].name); //make full path of the element
      let relPath = path.join(accRelPath, entries[i].name); //make rel path of the element
      if (entries[i].isFile()) {
        // check if the element is file
        if (path.extname(fullPath) === requiredExt) {
          entries2.push(relPath); // add to the list of entries
        }
      } else {
        //if not a file means a dir
        await dirContent(fullPath, relPath); // and run same scan for this particular dir
      }
    }
  }

  await dirContent(rootPath, initRelPath); //initial launch of the Workspace dir scan

  entries2.sort((a, b) => a.localeCompare(b));

  entries2.forEach((element) => console.log(element));
};

await findByExt();
