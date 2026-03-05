import { parseArgs } from "node:util";
import { createFileWithContent, drillDownFolder, getFileContent, isFolderExists } from "../lib/utils.js";
import path from "node:path";

const TARGET_FOLDER = "workspace/parts";
const defaultFileComparator = (pathTo) => pathTo.endsWith(".txt");
const fileComparator = (pathTo, files) => {
  const fileName = path.basename(pathTo);
  return files.includes(fileName);
};

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt

  const folderExists = await isFolderExists(TARGET_FOLDER);
  if (!folderExists) {
    throw new Error("FS operation failed");
  }

  const args = parseArgs({
    options: { files: { type: "string", default: "" } },
  });
  const argFiles = args.values.files ? args.values.files.split(",") : [];

  const defSearch = argFiles.length === 0;
  const foundedFiles = [];

  await drillDownFolder(path.resolve(TARGET_FOLDER), {
    runOnFile: async ({ pathTo, other }) => {
      if (
        defSearch
          ? defaultFileComparator(pathTo) // if no files - add only .txt files
          : fileComparator(pathTo, argFiles) // if files provided - add only them
      ) {
        other.push(pathTo);
      }
    },
    other: foundedFiles,
  });

  if (defSearch && foundedFiles.length === 0) {
    // If default search - but no .txt files found - throw error
    throw new Error("FS operation failed");
  } else if (!defSearch && foundedFiles.length !== argFiles.length) {
    // If files provided - but not all of them found - throw error
    throw new Error("FS operation failed");
  }

  const mergedContent = await Promise.all(
    foundedFiles.sort().map(async (file) => {
      const content = await getFileContent(file);
      return content;
    }),
  );

  const mergedContentStr = mergedContent.join("");

  await createFileWithContent(
    path.join("workspace", "merged.txt"),
    mergedContentStr,
  );
};

await merge();
