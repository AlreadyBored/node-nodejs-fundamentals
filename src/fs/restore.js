import * as url from "url";
import path from "path";
import * as fs from "fs/promises";

const restore = async () => {
  const pathToThisFile = url.fileURLToPath(import.meta.url); // path to this file from url to this file

  const pathToThisDir = path.dirname(pathToThisFile); // path to the directory with this file

  const snapshotPath = path.resolve(pathToThisDir, "../../snapshot.json");

  try {
    await fs.stat(snapshotPath);
  } catch (error) {
    throw new Error("FS operation failed");
  } // if we can not get stat about the json means it doesn't exist, we throw an error

  const restoreDirPath = path.resolve(
    pathToThisDir,
    "../../workspace_restored",
  );
  try {
    await fs.stat(restoreDirPath);
    throw new Error("FS operation failed");
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  await fs.mkdir(restoreDirPath);
  let snapshotContent = JSON.parse(await fs.readFile(snapshotPath, "utf8"));
  console.log(snapshotContent.entries);

  for (let i = 0; i < snapshotContent.entries.length; i++) {
    let restoreEntryPath = path.resolve(
      restoreDirPath,
      snapshotContent.entries[i].path,
    );
    if (snapshotContent.entries[i].type === "file") {
      let fileContent = Buffer.from(
        snapshotContent.entries[i].content,
        "base64",
      );
      await fs.writeFile(restoreEntryPath, fileContent);
      // преобразовать из Base64 и записать
    } else {
      await fs.mkdir(restoreEntryPath); // сделать директорию
    }
  }
};

await restore();
