import * as url from "url";
import path from "path";
import * as fs from "fs/promises";

//build path to this and other required dirs
const pathToThisFile = url.fileURLToPath(import.meta.url); // path to this file from url to this file
const pathToThisDir = path.dirname(pathToThisFile); // path to the directory with this file
const plaginPath = path.join(pathToThisDir, "/plugins");

//takes path to plugin, logs and exits if not found
const checkExist = async (pathToCheck) => {
  try {
    await fs.stat(pathToCheck);
  } catch (error) {
    console.log("Plagin not found");
    process.exit(1);
  }
};

/*
//takes argument name and default value, returns new value if argument exists
const checkCliArg = (reqArg, defVal = "") => {
  let newVal = defVal;
  let argIndex = process.argv.findIndex((cliArg) => cliArg === reqArg);
  if (argIndex > 1) {
    if (process.argv[argIndex + 1]) {
      newVal = process.argv[argIndex + 1];
    }
  }
  return newVal;
};
*/

const dynamic = async () => {
  let modulePathList = process.argv
    .slice(2)
    .map((s) => path.join(plaginPath, `${s}.js`));
  //console.log(modulePathList);
  const modulesArray = [];

  for (let i = 0; i < modulePathList.length; i++) {
    await checkExist(modulePathList[i]);
    modulesArray[i] = await import(modulePathList[i]);
    console.log(modulesArray[i].run());
  }
};

await dynamic();
