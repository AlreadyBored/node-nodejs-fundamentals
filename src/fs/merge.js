import * as url from "url";
import path from "path";
import * as fs from "fs/promises";

const checkExist = async (pathToCheck) => {
  try {
    await fs.stat(pathToCheck);
  } catch (error) {
    throw new Error("FS operation failed");
  }
};

async function dirFileList(dirToCheck, requiredExt, fileList = []) {
  //dir to scan with absolute path
  let entries = await fs.readdir(dirToCheck, { withFileTypes: true }); //get a list of content of the dir
  for (let i = 0; i < entries.length; i++) {
    //check each element in the dir content list
    let fullPath = path.join(dirToCheck, entries[i].name); //make full path of the element
    if (entries[i].isFile()) {
      // check if the element is file
      if (path.extname(fullPath) === requiredExt) {
        fileList.push(fullPath); // add to the list of entries
      }
    } else {
      //if not a file means a dir
      await dirFileList(fullPath, requiredExt, fileList); // and run same scan for this particular dir
    }
  }
  return fileList;
}

const merge = async () => {
  // 1 built way to Parts dir

  const pathToThisFile = url.fileURLToPath(import.meta.url); // path to this file from url to this file
  const pathToThisDir = path.dirname(pathToThisFile); // path to the directory with this file
  //const rootPath = path.resolve(pathToThisDir, "../../workspace"); // build path to the Workspace dir, 2 levels up
  const partsPath = path.resolve(pathToThisDir, "../../workspace/parts");
  var filesToMerge = [];

  // 2 check if Paths dir exists or error
  await checkExist(partsPath);
  /*
  try {
    await fs.stat(partsPath);
  } catch (error) {
    throw new Error("FS operation failed");
  }*/

  // 3 check argument --files, if exists transform to array of full paths

  let filesArgIndex = process.argv.findIndex((cliArg) => cliArg === "--files");
  if (filesArgIndex > 1) {
    if (process.argv[filesArgIndex + 1]) {
      let requiredFiles = process.argv[filesArgIndex + 1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => path.join(partsPath, s));
      // 3.1 check existance of files from paths array if not found throw error
      for (let element of requiredFiles) {
        await checkExist(element);
      }
      filesToMerge = requiredFiles;
    } else {
      throw new Error("No file names provided");
    }
  } else {
    // 4 if no --files find .txt files from dir make array of full paths,
    filesToMerge = await dirFileList(partsPath, ".txt");
    // 4.1 if array length is 0 throw error
    if (filesToMerge.length < 1) {
      throw new Error("FS operation failed");
    }
    // 4.3 sort paths array alphabetically
    filesToMerge.sort((a, b) => a.localeCompare(b));
  }
  // 5 make accumulator,
  let mergedFile = "";

  // 6 read each file by path in the paths array, and add to accumulator
  for (let pathElement of filesToMerge) {
    mergedFile += await fs.readFile(pathElement, "utf8");
  }

  // 7 save accumulator to file and write it
  await fs.writeFile(
    path.resolve(pathToThisDir, "../../workspace/merge.txt"),
    mergedFile,
    "utf8",
  );
};

await merge();
