import fs from "node:fs/promises";
import path from "node:path";

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt

  const workspaceDir = path.join(process.cwd(), "workspace");
  const partsDir = path.join(workspaceDir, "parts");
  const outputFile = path.join(workspaceDir, "merged.txt");

  const filesIndex = process.argv.indexOf("--files");

  let files = [];

  if (filesIndex !== -1) {
    files = process.argv[filesIndex + 1].split(",");
  } else {
    const entries = await fs.readdir(partsDir);
    files = entries.filter((file) => file.endsWith(".txt")).sort();
  }

  let mergedContent = "";

  for (const file of files) {
    const filePath = path.join(partsDir, file);
    const content = await fs.readFile(filePath, "utf8");
    mergedContent += content;
  }

  await fs.writeFile(outputFile, mergedContent);
};

await merge();
