import path from "path";
import fs from "fs/promises";

const restore = async () => {
  // Write your code here
  // Read snapshot.json
  // Treat snapshot.rootPath as metadata only
  // Recreate directory/file structure in workspace_restored

  try {
    await fs.stat("./snapshot.json");
  } catch {
    throw new Error("FS operation failed");
  }

  try {
    await fs.stat("./workspace_restored");
    // throw new Error("FS operation failed");
  } catch (e) {
    if (e.message === "FS operation failed") {
      throw e;
    }
    await fs.mkdir("./workspace_restored");
  }

  try {
    const data = await fs.readFile("./snapshot.json", "utf-8");
    const snapshot = JSON.parse(data);
    for (const item of snapshot.entries) {
      const filePath = path.join("./workspace_restored", item.path);
      console.log(filePath);
      if (item.type === "directory") {
        await fs.mkdir(filePath, { recursive: true });
      }
      if (item.type === "file") {
        await fs.writeFile(filePath, item.content, "base64");
      }
    }
  } catch (e) {
    console.log(e);
  }
};

await restore();
