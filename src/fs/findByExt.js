import path from "path";
import fs from "fs/promises";

const findByExt = async () => {
  // Write your code here
  // Recursively find all files with specific extension
  // Parse --ext CLI argument (default: .txt)

  try {
    await fs.stat("./workspace");
  } catch (e) {
    throw new Error("FS operation failed");
  }
  console.log(process.argv);
  let files = [];
  const extIndex = process.argv.indexOf("--ext");
  const ext = extIndex !== -1 ? process.argv[extIndex + 1] : "txt";
  // console.log(extIndex);
  // console.log(ext);

  const scan = async (currPath) => {
    const entries = await fs.readdir(currPath, { withFileTypes: true });
    // console.log(entries);
    for (const item of entries) {
      const fullPath = path.join(currPath, item.name);
      const relativePath = path
        .relative("./workspace", fullPath)
        .replace(/\\/g, "/");

      if (item.isDirectory()) {
        await scan(fullPath); // рекурсивно сканируем
      }

      if (item.isFile() && path.extname(item.name).slice(1) === ext) {
        files.push(relativePath); // сохраняем путь файла с нужным расширением
      }
    }
  };

  await scan("./workspace");
  files.sort().forEach((f) => console.log(f));
};

await findByExt();
