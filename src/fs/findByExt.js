import { access } from "node:fs/promises";
import { scanDirectory } from "./scanDirectory.js";
import { resolve } from "path";

const findByExt = async () => {
  const workspacePath = resolve("workspace");
  const args = process.argv.slice(2);
  const extIndex = args.indexOf("--ext");

  let targetExt = ".txt";

  if (extIndex !== -1 && args[extIndex + 1]) {
    targetExt = `.${args[extIndex + 1]}`;
  }

  try {
    await access(workspacePath);
    const fileList = await scanDirectory(workspacePath);

    fileList
      .filter((file) => file.path.includes(targetExt))
      .sort()
      .forEach((file) => console.log(file.path));
  } catch {
    throw new Error("FS operation failed");
  }
};

await findByExt();
