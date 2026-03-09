import fs from "fs";
import path from "path";

const merge = async () => {
  const partsDir = path.join(process.cwd(), "workspace", "parts");
  const outputFile = path.join(process.cwd(), "workspace", "merged.txt");

  let files;

  const filesIndex = process.argv.indexOf("--files");
  if (filesIndex !== -1) {
    const names = process.argv[filesIndex + 1].split(",");
    files = names.map((name) => path.join(partsDir, name.trim()));
  } else {
    const items = await fs.promises.readdir(partsDir);
    const txtFiles = items.filter((item) => path.extname(item) === ".txt");
    txtFiles.sort();
    files = txtFiles.map((name) => path.join(partsDir, name));
  }

  let merged = "";
  for (const file of files) {
    const content = await fs.promises.readFile(file, "utf-8");
    merged += content;
  }

  await fs.promises.writeFile(outputFile, merged, "utf-8");

  console.log(`✓ Merged ${files.length} file(s) into workspace/merged.txt`);
  for (const file of files) {
    console.log(" ", path.basename(file));
  }
};

await merge();
