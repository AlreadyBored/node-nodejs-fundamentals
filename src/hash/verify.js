import * as url from "url";
import path from "path";
import * as fsp from "fs/promises";
import * as fs from "fs";
import { createHash } from "crypto";

const pathToThisFile = url.fileURLToPath(import.meta.url); // path to this file from url to this file
const pathToThisDir = path.dirname(pathToThisFile); // path to the directory with this file
const checksumsPath = path.join(pathToThisDir, "/checksums.json");

const isWriteMode = () => {
  var mode = false;
  const extArgIndex = process.argv.findIndex((cliArg) => cliArg === "--write");
  extArgIndex > 1 ? (mode = true) : (mode = false);
  //console.log(mode);
  return mode;
};

// second mode with arg - create json file
const writeFiles = async () => {
  await fsp.writeFile(path.join(pathToThisDir, "/file1.txt"), "AbraCadabra");
  await fsp.writeFile(path.join(pathToThisDir, "/file2.txt"), "TumbaYumba");
  let hashFile1 = await calcSha256(path.join(pathToThisDir, "/file1.txt"));
  let hashFile2 = await calcSha256(path.join(pathToThisDir, "/file2.txt"));
  let hashList = {
    "file1.txt": hashFile1,
    "file2.txt": hashFile2,
  };
  let checksumContent = JSON.stringify(hashList, null, 2);
  await fsp.writeFile(checksumsPath, checksumContent, "utf8");
};

// async func to calc hash of file
const calcSha256 = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => {
      hash.update(chunk);
    });

    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
};

const checkFiles = async () => {
  try {
    await fsp.stat(checksumsPath);
  } catch (error) {
    throw new Error("FS operation failed");
  }
  let jsonContent = JSON.parse(await fsp.readFile(checksumsPath, "utf8"));
  const fileNames = Object.keys(jsonContent);
  for (let i = 0; i < fileNames.length; i++) {
    let hashFile = await calcSha256(path.join(pathToThisDir, fileNames[i]));
    hashFile === jsonContent[fileNames[i]]
      ? console.log(fileNames[i] + " - OK")
      : console.log(fileNames[i] + " - FAIL");
  }
};

const verify = async () => {
  isWriteMode() ? await writeFiles() : await checkFiles();
};

// build the path to json file and check it exists

// read the json file
// build array with paths to files and their hashes
// for each file check the file exist, recalculate hash of it and compare with awailable, print a line

await verify();
