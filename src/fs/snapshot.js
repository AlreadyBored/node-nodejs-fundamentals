import * as url from "url";
import path from "path";
import * as fs from "fs/promises";

const snapshot = async () => {
  const pathToThisFile = url.fileURLToPath(import.meta.url); // path to this file from url to this file

  const pathToThisDir = path.dirname(pathToThisFile); // path to the directory with this file

  const rootPath = path.resolve(pathToThisDir, "../../workspace"); // build path to the Workspace dir, 2 levels up

  try {
    await fs.stat(rootPath);
  } catch (error) {
    throw new Error("FS operation failed");
  } // if we can not get stat about the Workspace means it doesn't exist, we throw an error

  //let entries = [];
  let entries2 = []; //an array for the list of files and dirs
  let initRelPath = ""; // initial relative path to start scanning equals to nothing to start scan from Workspace dir itself

  async function dirContent(dirToCheck, accRelPath) {
    //dir to scan with absolute and relative paths
    let entries = await fs.readdir(dirToCheck, { withFileTypes: true }); //get a list of content of the dir
    for (let i = 0; i < entries.length; i++) {
      //check each element in the dir content list
      let newElement = {}; // we'll build an object for each dir element
      let fullPath = path.join(dirToCheck, entries[i].name); //make full path of the element
      let relPath = path.join(accRelPath, entries[i].name); //make rel path of the element
      if (entries[i].isFile()) {
        // if the element is file
        let fileStat = await fs.stat(fullPath); //get Dirent with file info
        let fileBuffer = await fs.readFile(fullPath);
        let fileContent = fileBuffer.toString("base64");
        newElement = {
          path: relPath,
          type: "file",
          size: fileStat.size,
          content: fileContent,
        }; //add 4 required fields
        entries2.push(newElement); // add to the list of entries
      } else {
        //if not a file means a dir
        newElement = {
          path: relPath,
          type: "directory",
        }; //add 2 required fields
        entries2.push(newElement); // add to the list of entries
        await dirContent(fullPath, relPath); // and run same scan for this particular dir
      }
    }
  }

  await dirContent(rootPath, initRelPath); //initial launch of the Workspace dir scan

  let snapshotResult = {
    rootPath: rootPath,
    entries: entries2,
  }; // make the output object
  //сделать JSON
  //console.log(snapshotResult);
  let jsonContent = JSON.stringify(snapshotResult, null, 2);
  let jsonPath = path.resolve(rootPath, "..", "snapshot.json");
  await fs.writeFile(jsonPath, jsonContent, "utf8");
};

await snapshot();
