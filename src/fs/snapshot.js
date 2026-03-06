import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const snapshot = async () => {
  const workspacePath = path.join(__dirname, "..", "..", "workspace");

  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error("FS operation failed");
  }

  const contents = await fs.readdir(workspacePath, { recursive: true });
  const entries = [];

  for (const content of contents) {
    const absolutePath = path.join(workspacePath, content);
    const stats = await fs.stat(absolutePath);
    const relativePath = content.split(path.sep).join("/");

    if (stats.isDirectory()) {
      entries.push({ path: relativePath, type: "directory" });
    } else {
      const fileContent = await fs.readFile(absolutePath);
      entries.push({
        path: relativePath,
        type: "file",
        size: stats.size,
        content: fileContent.toString("base64"),
      });
    }
  }

  const result = {
    rootPath: workspacePath,
    entries,
  };

  await fs.writeFile(
    path.join(__dirname, "..", "..", "snapshot.json"),
    JSON.stringify(result, null, 2),
  );
};

await snapshot();
