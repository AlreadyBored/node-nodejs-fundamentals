// import { glob } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { isFolderExists, drillDownFolder } from "../lib/utils.js";

const DEFAULT_EXT = "txt";
const TARGET_FOLDER = "workspace";

const findByExt = async () => {
  // Write your code here
  // Recursively find all files with specific extension
  // Parse --ext CLI argument (default: .txt)
  const folderExists = await isFolderExists(TARGET_FOLDER);
  if (!folderExists) {
    throw new Error("FS operation failed");
  }

  const args = parseArgs({
    options: { ext: { type: "string", default: DEFAULT_EXT } },
  });
  const ext = args.values.ext;

  // Node 22 has usefull methods out of the box :)
  // const arr = await Array.fromAsync(glob(`workspace/**/*.${ext}`));
  // arr.sort().forEach((file) => console.log(file));

  // but the ticket requires using recursion, so let's do it the hard way
  const rootPath = path.resolve(TARGET_FOLDER);
  const context = [];

  await drillDownFolder(rootPath, {
    runOnFile: async ({ pathTo, other }) => {
      if (pathTo.endsWith(`.${ext}`)) {
        other.push(pathTo);
      }
    },
    other: context,
  });

  context.sort().forEach((file) => console.log(file));
};

await findByExt();
