import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const findByExt = async () => {
  const args = process.argv.slice(2);
  const extIndex = args.lastIndexOf("--ext");
  const extension =
    extIndex !== -1 && args[extIndex + 1] ? args[extIndex + 1] : "txt";

  const workspacePath = path.join(__dirname, "..", "..", "workspace");

  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error("FS operation failed");
  }

  const filePaths = await fs.readdir(workspacePath, { recursive: true });
  const normalizedExtension = "." + extension;

  const filteredPaths = filePaths.filter((filePath) =>
    filePath.endsWith(normalizedExtension),
  );

  const sortedPaths = filteredPaths.sort((a, b) => a.localeCompare(b));

  for (const filePath of sortedPaths) {
    console.log(filePath);
  }
};

await findByExt();
