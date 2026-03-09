import fs from "fs";
import path from "path";

async function scanDir(dirPath, ext, results = []) {
  const items = await fs.promises.readdir(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = await fs.promises.stat(fullPath);

    if (stat.isDirectory()) {
      if (item === "node_modules") continue;
      await scanDir(fullPath, ext, results);
    } else {
      if (path.extname(item) === ext) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

const findByExt = async () => {
  const args = process.argv;
  const extIndex = args.indexOf("--ext");
  let ext = extIndex !== -1 ? args[extIndex + 1] : ".txt";

  if (!ext.startsWith(".")) ext = "." + ext;

  const results = await scanDir(process.cwd(), ext);
  results.sort();

  if (results.length === 0) {
    console.log(`No files found with extension ${ext}`);
  } else {
    console.log(`Found ${results.length} file(s) with extension ${ext}:`);
    for (const file of results) {
      console.log(" ", file);
    }
  }
};

await findByExt();
