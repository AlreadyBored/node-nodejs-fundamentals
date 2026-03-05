import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const snapshot = async () => {
  const workspace = path.join(process.cwd(), "workspace");
  try {
    if (!(await fs.stat(workspace)).isDirectory()) {
      throw new Error(`FS operation failed`);
    }
  } catch {
    throw new Error(`FS operation failed`);
  }
  const files = await fs.readdir(workspace, {
    recursive: true,
    withFileTypes: true,
  });
  const entries = await Promise.all(
    files?.map(async (file) => {
      const fullPath = path.join(file?.parentPath, file?.name);
      const fileStat = await fs.stat(fullPath);
      let fileContent = "";
      try {
        if (file?.isFile()) {
          fileContent = await fs.readFile(fullPath);
        }
      } catch (err) {
        console.error(`FS operation failed`);
      }

      return {
        path: path.relative(workspace, fullPath),
        type: file?.isFile() ? "file" : "directory",
        ...(file?.isFile()
          ? {
              size: fileStat.size,
              content: fileContent ? fileContent.toString("base64") : "",
            }
          : {}),
      };
    }),
  );
  fs.writeFile(
    "./snapshot.json",
    JSON.stringify(
      {
        rootPath: process.cwd(),
        entries,
      },
      null,
      2,
    ),
    "utf-8",
  );
  console.log("snapshot.json is created successfully!");
};

await snapshot();
