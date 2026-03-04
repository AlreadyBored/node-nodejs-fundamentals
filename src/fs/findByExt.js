import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scanDirectory } from "./scanDirectory.js";

const findByExt = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const workspacePath = path.resolve(__dirname, "workspace");
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
