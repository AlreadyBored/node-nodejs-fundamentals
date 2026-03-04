import fs from "fs/promises";
import path from "path";

const restore = async () => {
  const restoredFolder = "./workspace_restored";
  await fs.rm(restoredFolder, { recursive: true, force: true });
  fs.mkdir(restoredFolder, { recursive: true });
  const fileContent = await fs.readFile("./snapshot.json", "utf-8");
  const pathObj = JSON.parse(fileContent);
  for (const entry of pathObj.entries) {
    if (entry.type === "file") {
      await fs.mkdir(path.join(restoredFolder, path.dirname(entry.path)), {
        recursive: true,
      });
      fs.writeFile(
        path.join(restoredFolder, entry.path),
        entry.content,
        "base64",
      );
    } else {
      fs.mkdir(path.join(restoredFolder, entry.path), { recursive: true });
    }
  }
  console.log("workspace_restored folder successfully created!");
};

await restore();
